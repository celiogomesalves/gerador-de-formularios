import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Layout, FileText, LogOut, Sparkles, ExternalLink, Edit, Trash2, Copy, BookOpen } from 'lucide-react';
import { getOrCreateFolder, listForms, deleteFormFromDrive, getFormFromDrive, saveFormToDrive } from '../lib/googleDrive';

export default function Home({ session, setSession }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folderId, setFolderId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const token = session.access_token;

  const loadFormsFromDrive = async () => {
    try {
      setLoading(true);
      const fId = await getOrCreateFolder(token);
      setFolderId(fId);
      
      const driveFiles = await listForms(token, fId);
      
      const formattedForms = driveFiles.map(file => ({
        token: file.id,
        title: file.name.replace('.json', ''),
        date: new Date(file.createdTime).toLocaleDateString(),
        fieldsCount: '?'
      }));
      
      setForms(formattedForms);
    } catch (e) {
      console.error('Error loading forms from Drive', e);
      if (e.message.includes('403') || e.message.includes('401')) {
         alert('Permissões insuficientes ou token expirado. Por favor, faça login novamente e marque a caixa permitindo o acesso ao Drive.');
         handleLogout();
      } else {
         alert('Falha temporária ao sincronizar com o Google Drive. Recarregue a página.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormsFromDrive();
    if (token) {
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { "Authorization": "Bearer " + token }
      })
      .then(r => r.json())
      .then(d => setUserProfile(d))
      .catch(e => console.error(e));
    }
  }, [token]);

  const createNewForm = () => {
    const newToken = `new_${uuidv4()}`;
    navigate(`/builder/${newToken}`);
  };

  const deleteForm = async (fileId) => {
    if (window.confirm('Tem certeza que deseja excluir este formulÃ¡rio do seu Google Drive?')) {
      try {
        await deleteFormFromDrive(token, fileId);
        loadFormsFromDrive();
      } catch (e) {
        alert('Erro ao excluir: ' + e.message);
      }
    }
  };

  const duplicateForm = async (fileId) => {
    try {
      const data = await getFormFromDrive(token, fileId);
      
      if (data.design && data.design.titleText) {
        data.design.titleText = `${data.design.titleText} (CÃ³pia)`;
      }
      
      await saveFormToDrive(token, folderId, data.design.titleText, data, null);
      
      loadFormsFromDrive();
    } catch (e) {
      alert('Erro ao duplicar: ' + e.message);
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
            <Layout size={18} /> Meus FormulÃ¡rios
          </button>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Gerencie seus formulÃ¡rios sincronizados com o Google Drive.</p>
          </div>
          <button className="btn btn-primary" onClick={createNewForm} disabled={loading}>
            <Plus size={20} /> Criar Novo FormulÃ¡rio
          </button>
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
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Nenhum formulÃ¡rio criado</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>VocÃª ainda nÃ£o criou nenhum formulÃ¡rio. Comece agora mesmo e sincronize com seu Drive.</p>
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
                      <span style={{ opacity: 0.3 }}>â€¢</span>
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
    </div>
  );
}

