import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Layout, FileText, LogOut, Sparkles, ExternalLink, Edit, Trash2, Copy, BookOpen, Crown } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useCustomDialog } from '../context/CustomDialogContext';
import { getOrCreateFolder, listForms, deleteFormFromDrive, getFormFromDrive, saveFormToDrive } from '../lib/googleDrive';

export default function Home({ session, setSession }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folderId, setFolderId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showReconnectModal, setShowReconnectModal] = useState(false);
  const { showAlert, showConfirm, showToast } = useCustomDialog();
  const navigate = useNavigate();
  const token = session?.access_token;

  const reconnectGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const hasDriveAccess = tokenResponse.scope && tokenResponse.scope.includes('drive.file');
      if (!hasDriveAccess) {
        showAlert({
          title: 'Permissão Necessária',
          message: 'Você precisa marcar a caixa permitindo o acesso ao Google Drive para podermos carregar e gerenciar seus formulários.',
          type: 'warning'
        });
        return;
      }
      const expiry = Date.now() + (tokenResponse.expires_in * 1000);
      localStorage.setItem('google_access_token', tokenResponse.access_token);
      localStorage.setItem('google_token_expiry', expiry.toString());
      setSession(prev => ({ ...(prev || {}), access_token: tokenResponse.access_token, isExpired: false }));
      setShowReconnectModal(false);
      showToast({ message: 'Conta Google reconectada com sucesso!', type: 'success' });
      loadFormsFromDrive(tokenResponse.access_token);
    },
    onError: (err) => {
      showAlert({
        title: 'Falha ao Reconectar',
        message: 'Não foi possível reconectar com a conta Google: ' + (err.message || err),
        type: 'error'
      });
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    prompt: 'consent'
  });

  const loadFormsFromDrive = async (activeToken = null) => {
    const currentToken = activeToken || token;
    if (!currentToken || session?.isExpired) {
      setShowReconnectModal(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fId = await getOrCreateFolder(currentToken);
      setFolderId(fId);
      
      const driveFiles = await listForms(currentToken, fId);
      
      const formattedForms = driveFiles.map(file => ({
        token: file.id,
        title: file.name.replace('.json', ''),
        date: new Date(file.createdTime).toLocaleDateString(),
        fieldsCount: '?'
      }));
      
      setForms(formattedForms);
    } catch (e) {
      console.error('Error loading forms from Drive', e);
      if (e.message.includes('403') || e.message.includes('401') || e.message.toLowerCase().includes('token')) {
         setShowReconnectModal(true);
      } else {
         showToast({
           title: 'Sincronização',
           message: 'Falha temporária ao sincronizar com o Google Drive. Recarregue a página.',
           type: 'warning'
         });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormsFromDrive();
    if (token && !session?.isExpired) {
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { "Authorization": "Bearer " + token }
      })
      .then(r => r.json())
      .then(async d => {
        setUserProfile(d);
        if (d.email) {
          localStorage.setItem('user_email', d.email);
          try {
            const subRes = await fetch(`/api/subscription?action=get_or_create&email=${encodeURIComponent(d.email)}&name=${encodeURIComponent(d.name || '')}`);
            if (subRes.ok) {
              const subData = await subRes.json();
              setSubscription(subData);
              localStorage.setItem('user_subscription', JSON.stringify(subData));
            }
          } catch (subErr) {
            console.error('Erro ao verificar assinatura:', subErr);
          }
        }
      })
      .catch(e => console.error(e));
    }
  }, [token]);

  const createNewForm = () => {
    // Validação de cota do Plano Free (1 formulário ativo)
    if (subscription && !subscription.isOwner && subscription.plan === 'free' && forms.length >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    const newToken = `new_${uuidv4()}`;
    navigate(`/builder/${newToken}`);
  };

  const deleteForm = async (fileId) => {
    const confirmed = await showConfirm({
      title: 'Excluir Formulário',
      message: 'Tem certeza que deseja excluir permanentemente este formulário do seu Google Drive?',
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await deleteFormFromDrive(token, fileId);
        showToast({ message: 'Formulário excluído com sucesso!', type: 'success' });
        loadFormsFromDrive();
      } catch (e) {
        if (e.message.includes('401') || e.message.includes('403')) {
          setShowReconnectModal(true);
        } else {
          showAlert({ title: 'Erro ao excluir', message: e.message, type: 'error' });
        }
      }
    }
  };

  const duplicateForm = async (fileId) => {
    if (subscription && !subscription.isOwner && subscription.plan === 'free' && forms.length >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    try {
      const data = await getFormFromDrive(token, fileId);
      
      if (data.design && data.design.titleText) {
        data.design.titleText = `${data.design.titleText} (Cópia)`;
      }
      
      await saveFormToDrive(token, folderId, data.design.titleText, data, null);
      showToast({ message: 'Formulário duplicado com sucesso!', type: 'success' });
      loadFormsFromDrive();
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('403')) {
        setShowReconnectModal(true);
      } else {
        showAlert({ title: 'Erro ao duplicar', message: e.message, type: 'error' });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    setSession(null);
  };

  return (
    <div className="app-container">
      {/* Sidebar Nav */}
      <aside className="sidebar">
        <h2>
          <Sparkles size={22} style={{ color: 'var(--accent-color)' }} /> FormGen Studio
        </h2>
        
                <div className="tabs">
          <button className="tab-btn active">
            <Layout size={18} /> Meus Formulários
          </button>
          <button className="tab-btn" onClick={() => navigate('/manual')}>
            <BookOpen size={18} /> Manual do Sistema
          </button>
          {subscription && !subscription.isOwner && subscription.plan === 'free' && (
            <button 
              className="tab-btn" 
              onClick={() => navigate('/pricing')}
              style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.25)' }}
            >
              <Crown size={18} /> Assinar Premium
            </button>
          )}
          {(subscription?.isOwner || userProfile?.email?.toLowerCase() === 'celiogomesalves@gmail.com') && (
            <button 
              className="tab-btn" 
              onClick={() => navigate('/admin')}
              style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.4)', marginTop: 8 }}
            >
              <Crown size={18} /> Painel do Dono
            </button>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card de Upgrade Fixo para Usuários Free */}
          {subscription && !subscription.isOwner && subscription.plan === 'free' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.05))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: 14,
              marginBottom: 4
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Crown size={16} color="#f59e0b" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>Plano Free</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{forms.length}/1 Form</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                Desbloqueie formulários ilimitados por apenas R$ 19,90/mês.
              </p>
              <button 
                onClick={() => navigate('/pricing')}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderColor: '#f59e0b',
                  color: '#fff'
                }}
              >
                Fazer Upgrade →
              </button>
            </div>
          )}

          {userProfile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {userProfile.picture ? (
                <img src={userProfile.picture} alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {userProfile.name?.[0] || userProfile.email?.[0] || 'U'}
                </div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userProfile.name || 'Usuário'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userProfile.email}</div>
                {subscription && (
                  <div style={{ marginTop: 4 }}>
                    {subscription.isOwner ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        👑 DONO DO PROJETO
                      </span>
                    ) : subscription.plan === 'premium' ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        💎 PREMIUM
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                        🆓 PLANO FREE (1 Form)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <button className="tab-btn" onClick={handleLogout} style={{ color: 'var(--danger-color)' }}>
            <LogOut size={18} /> Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ flexDirection: 'column', overflowY: 'auto' }}>
        <div className="glass-header">
          <div>
            <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Gerencie seus formulários sincronizados com o Google Drive.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {subscription && !subscription.isOwner && subscription.plan === 'free' && (
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/pricing')}
                style={{ 
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                  borderColor: '#f59e0b', 
                  color: '#fff',
                  fontWeight: 700,
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Sparkles size={16} /> Fazer Upgrade (R$ 19,90)
              </button>
            )}
            <button className="btn btn-primary" onClick={createNewForm} disabled={loading}>
              <Plus size={20} /> Criar Novo Formulário
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 60px 48px', width: '100%' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: '3px solid rgba(96, 165, 250, 0.2)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <div style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>Sincronizando com o Google Drive...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : forms.length === 0 ? (
            <div className="glass-panel animate-fade-up" style={{ textAlign: 'center', padding: '80px 24px', borderRadius: 'var(--radius-lg)', borderStyle: 'dashed', borderWidth: 1 }}>
              <FileText size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Nenhum formulário criado</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>Você ainda não criou nenhum formulário. Comece agora mesmo e sincronize com seu Drive.</p>
              <button className="btn btn-primary" onClick={createNewForm} style={{ padding: '12px 32px' }}>Criar Meu Primeiro Form</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {forms.map((form, index) => (
                <div key={form.token} className="glass-panel animate-fade-up" style={{ borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', animationDelay: `${index * 0.1}s` }}>
                  <div style={{ marginBottom: 'auto' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{form.title}</h3>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 999 }}>
                        <img src="https://www.google.com/drive/static/images/drive/logo-drive.png" height="14" alt="Drive" /> Google Drive
                      </span>
                      <span style={{ opacity: 0.3 }}>•</span>
                      <span>{form.date}</span>
                    </div>
                  </div>
                  
                  <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', margin: '24px 0' }} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button className="btn btn-primary" style={{ padding: '10px' }} onClick={() => navigate(`/builder/${form.token}`)}>
                      <Edit size={16} /> Editar
                    </button>
                    <button className="btn btn-outline" style={{ padding: '10px' }} onClick={() => window.open(`/f/${form.token}?preview=true`, '_blank')}>
                      <ExternalLink size={16} /> Ver Ao Vivo
                    </button>
                    <button className="btn btn-outline" style={{ padding: '10px' }} onClick={() => duplicateForm(form.token)}>
                      <Copy size={16} /> Duplicar
                    </button>
                    <button className="btn btn-outline" style={{ padding: '10px', color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }} onClick={() => deleteForm(form.token)}>
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
        </div>
      </main>

      {/* Modal de Upgrade de Plano Asaas */}
      {showUpgradeModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div className="glass-panel animate-fade-up" style={{
            maxWidth: 480,
            width: '100%',
            padding: 36,
            borderRadius: 20,
            textAlign: 'center',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-builder)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Crown size={32} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>Limite do Plano Free Atingido</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              O <strong>Plano Free</strong> permite criar e manter <strong>1 formulário ativo</strong> na sua conta. Para criar formulários ilimitados e desbloquear todos os recursos, faça o upgrade para o <strong>Plano Premium</strong>!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate('/pricing');
                }}
                className="btn btn-primary"
                style={{
                  padding: '14px',
                  fontSize: 15,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderColor: '#f59e0b',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Crown size={18} /> Conhecer o Plano Premium (R$ 19,90/mês) →
              </button>

              {subscription?.asaasPaymentUrl && (
                <a 
                  href={subscription.asaasPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{
                    padding: '12px',
                    fontSize: 14,
                    color: '#10b981',
                    borderColor: 'rgba(16, 185, 129, 0.4)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  Ir Direto para Pagamento no Asaas <ExternalLink size={14} />
                </a>
              )}

              <button 
                className="btn btn-outline" 
                onClick={() => setShowUpgradeModal(false)}
                style={{ padding: '12px', fontSize: 14 }}
              >
                Continuar no Plano Free (Gerenciar Atual)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reconexão Automática do Google */}
      {showReconnectModal && (
        <div 
          style={{
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.75)', 
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 99999,
            padding: 20
          }}
        >
          <div 
            className="animate-fade-up" 
            style={{
              background: 'var(--card-bg, #0f172a)',
              color: 'var(--text-main, #f8fafc)',
              borderRadius: 16,
              padding: 32,
              maxWidth: 460,
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--accent-color, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <Sparkles size={28} />
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              Sessão Expirada
            </h3>
            
            <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              Sua autorização de acesso ao Google Drive expirou. Clique no botão abaixo para reconectar rapidamente sua conta e continuar gerenciando seus formulários.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                type="button"
                className="btn btn-outline" 
                onClick={handleLogout}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 10, fontSize: 14 }}
              >
                Sair
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => reconnectGoogle()}
                style={{ 
                  flex: 2, 
                  padding: '12px 20px', 
                  borderRadius: 10, 
                  fontSize: 14, 
                  fontWeight: 600,
                  background: 'var(--accent-color, #3b82f6)',
                  borderColor: 'var(--accent-color, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                }}
              >
                <Sparkles size={16} /> Reconectar Conta Google
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

