import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Crown, MessageCircle, Users, Shield, CheckCircle2, AlertCircle, ArrowLeft, 
  ExternalLink, Search, RefreshCw, Copy, Check, Sliders, Sparkles, 
  ToggleLeft, ToggleRight, DollarSign, Lock
} from 'lucide-react';

const OWNER_EMAIL = 'celiogomesalves@gmail.com';

export default function Admin({ session }) {
  const navigate = useNavigate();
  const currentUserEmail = session?.user?.email || localStorage.getItem('user_email') || '';
  const isOwner = currentUserEmail.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, free: 0, premium: 0 });
  const [asaasUrl, setAsaasUrl] = useState('');
  const [newAsaasUrl, setNewAsaasUrl] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [newWhatsappUrl, setNewWhatsappUrl] = useState('');
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/subscription?action=list_users&adminEmail=${encodeURIComponent(currentUserEmail)}`);
      if (!res.ok) throw new Error('Falha ao carregar dados administrativos');
      const data = await res.json();
      
      setUsers(data.users || []);
      setAsaasUrl(data.asaasPaymentUrl || '');
      setNewAsaasUrl(data.asaasPaymentUrl || '');
      setWhatsappUrl(data.whatsappSupportUrl || '');
      setNewWhatsappUrl(data.whatsappSupportUrl || '');
      setStats({
        total: data.totalUsers || 0,
        free: data.freeUsers || 0,
        premium: data.premiumUsers || 0
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar painel administrativo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchAdminData();
    }
  }, [isOwner]);

  const handleSaveWhatsappUrl = async (e) => {
    e.preventDefault();
    try {
      setSavingWhatsapp(true);
      const res = await fetch('/api/subscription?action=save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: currentUserEmail,
          whatsappSupportUrl: newWhatsappUrl.trim()
        })
      });
      if (!res.ok) throw new Error('Falha ao salvar link do WhatsApp');
      setWhatsappUrl(newWhatsappUrl.trim());
      alert('Link de suporte via WhatsApp salvo com sucesso!');
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleSaveAsaasUrl = async (e) => {
    e.preventDefault();
    try {
      setSavingUrl(true);
      const res = await fetch('/api/subscription?action=save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: currentUserEmail,
          asaasPaymentUrl: newAsaasUrl.trim()
        })
      });
      if (!res.ok) throw new Error('Falha ao salvar link');
      setAsaasUrl(newAsaasUrl.trim());
      alert('Link de pagamento do Asaas salvo com sucesso!');
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSavingUrl(false);
    }
  };

  const handleTogglePlan = async (user) => {
    const nextPlan = user.plan === 'premium' ? 'free' : 'premium';
    const confirmMsg = nextPlan === 'premium' 
      ? `Promover ${user.email} para o Plano PREMIUM (ilimitado)?`
      : `Mudar ${user.email} para o Plano FREE (limite de 1 formulário)?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(user.email);
      const res = await fetch('/api/subscription?action=update_plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: currentUserEmail,
          userEmail: user.email,
          plan: nextPlan
        })
      });
      if (!res.ok) throw new Error('Falha ao atualizar plano');
      
      // Update local state
      setUsers(prev => prev.map(u => u.email === user.email ? { ...u, plan: nextPlan, forms_limit: nextPlan === 'premium' ? 999999 : 1 } : u));
      setStats(prev => ({
        ...prev,
        free: nextPlan === 'free' ? prev.free + 1 : prev.free - 1,
        premium: nextPlan === 'premium' ? prev.premium + 1 : prev.premium - 1
      }));
    } catch (err) {
      alert('Erro ao atualizar: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      setActionLoading(user.email);
      const res = await fetch('/api/subscription?action=update_plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: currentUserEmail,
          userEmail: user.email,
          status: nextStatus
        })
      });
      if (!res.ok) throw new Error('Falha ao alterar status');
      setUsers(prev => prev.map(u => u.email === user.email ? { ...u, status: nextStatus } : u));
    } catch (err) {
      alert('Erro ao alterar status: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const copySerial = (serial) => {
    navigator.clipboard.writeText(serial);
    setCopiedId(serial);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Access check
  if (!isOwner) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: 24 }}>
        <div className="glass-panel" style={{ maxWidth: 460, width: '100%', padding: 40, borderRadius: 20, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>Acesso Restrito</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Esta área é exclusiva e restrita ao responsável pelo projeto (<strong>{OWNER_EMAIL}</strong>). Sua conta não possui privilégios de administrador.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>
            <ArrowLeft size={16} /> Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (u.email || '').toLowerCase().includes(q) ||
           (u.name || '').toLowerCase().includes(q) ||
           (u.serial_key || '').toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Admin Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, marginBottom: 0, padding: '16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 13, gap: 6, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar ao Sistema
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={20} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Painel do Responsável</h1>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>DONO</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{currentUserEmail}</p>
            </div>
          </div>
        </div>

        <button className="btn btn-outline" onClick={fetchAdminData} disabled={loading} style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </header>

      {/* Main Content Area */}
      <div style={{ maxWidth: 1300, margin: '0 auto', width: '100%', padding: '32px 24px 80px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div className="glass-panel" style={{ padding: 24, borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Total de Usuários</span>
              <div style={{ padding: 8, borderRadius: 8, background: 'rgba(96, 165, 250, 0.15)', color: 'var(--accent-color)' }}><Users size={20} /></div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>{stats.total}</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Contas sincronizadas no Supabase</span>
          </div>

          <div className="glass-panel" style={{ padding: 24, borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Plano Free (1 Form)</span>
              <div style={{ padding: 8, borderRadius: 8, background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}><CheckCircle2 size={20} /></div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)' }}>{stats.free}</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Usuários com cota gratuita</span>
          </div>

          <div className="glass-panel" style={{ padding: 24, borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>Assinantes Premium</span>
              <div style={{ padding: 8, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}><Crown size={20} /></div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>{stats.premium}</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Acesso irrestrito a formulários</span>
          </div>

          <div className="glass-panel" style={{ padding: 24, borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Link Asaas Ativo</span>
              <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}><DollarSign size={20} /></div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: asaasUrl ? '#10b981' : 'var(--danger-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {asaasUrl ? 'Configurado ✅' : 'Não Definido ⚠️'}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Link de upgrade aos usuários</span>
          </div>

          <div className="glass-panel" style={{ padding: 24, borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Suporte WhatsApp</span>
              <div style={{ padding: 8, borderRadius: 8, background: 'rgba(37, 211, 102, 0.15)', color: '#25D366' }}><MessageCircle size={20} /></div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: whatsappUrl ? '#25D366' : 'var(--danger-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {whatsappUrl ? 'Ativo ✅' : 'Não Definido ⚠️'}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Botão flutuante para clientes</span>
          </div>
        </div>

        {/* Asaas Payment Link Configuration */}
        <div className="glass-panel" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <DollarSign size={22} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Link de Pagamento Asaas (Plano Premium)</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            Cole abaixo o link de pagamento ou assinatura criado no seu painel do Asaas. Quando um usuário no Plano Free atingir o limite de 1 formulário, ele receberá este link ao clicar em "Fazer Upgrade".
          </p>

          <form onSubmit={handleSaveAsaasUrl} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input 
              type="url" 
              placeholder="https://www.asaas.com/c/ou_link_da_sua_cobranca..."
              value={newAsaasUrl}
              onChange={(e) => setNewAsaasUrl(e.target.value)}
              className="public-form-input"
              style={{
                flex: 1,
                minWidth: 300,
                background: 'rgba(0,0,0,0.3)',
                borderColor: 'var(--border-builder)',
                color: '#fff',
                borderRadius: 'var(--radius-sm)'
              }}
              required
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={savingUrl}
              style={{ padding: '12px 24px', fontSize: 14, background: '#10b981', borderColor: '#10b981' }}
            >
              {savingUrl ? 'Salvando...' : 'Salvar Link do Asaas'}
            </button>
          </form>

          {asaasUrl && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>Link atual ativo:</span>
              <a href={asaasUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {asaasUrl} <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>


        {/* WhatsApp Support Link Configuration */}
        <div className="glass-panel" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #25D366, #128C7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <MessageCircle size={18} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Canal de Suporte via WhatsApp</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
            Informe o número de WhatsApp com DDD (ex: <code>5531982964066</code> ou <code>(31) 98296-4066</code>) ou o link direto <code>https://wa.me/...</code>. Este canal será aberto automaticamente quando o cliente clicar no botão flutuante de suporte na plataforma.
          </p>

          <form onSubmit={handleSaveWhatsappUrl} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Ex: 5531982964066 ou https://wa.me/5531982964066..."
              value={newWhatsappUrl}
              onChange={(e) => setNewWhatsappUrl(e.target.value)}
              className="public-form-input"
              style={{
                flex: 1,
                minWidth: 300,
                background: 'rgba(0,0,0,0.3)',
                borderColor: 'var(--border-builder)',
                color: '#fff',
                borderRadius: 'var(--radius-sm)'
              }}
              required
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={savingWhatsapp}
              style={{ padding: '12px 24px', fontSize: 14, background: '#25D366', borderColor: '#25D366', color: '#fff' }}
            >
              {savingWhatsapp ? 'Salvando...' : 'Salvar Link do WhatsApp'}
            </button>
          </form>

          {whatsappUrl && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>Canal atual configurado:</span>
              <a 
                href={whatsappUrl.startsWith('http') ? whatsappUrl : `https://wa.me/${whatsappUrl.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                {whatsappUrl} <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Users Management Table */}
        <div className="glass-panel" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Gerenciamento de Assinaturas & Licenças</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Altere planos manualmente, consulte os números de série gerados ou suspenda acessos.
              </p>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Buscar por nome, e-mail ou serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-builder)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-builder)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Usuário</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Número de Série (Serial)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Plano Atual</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Cota</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Carregando dados do Supabase...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isUserOwner = user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
                    const isPremium = user.plan === 'premium';
                    const isActive = user.status === 'active';

                    return (
                      <tr key={user.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s ease' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name || 'Usuário'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-builder)', fontFamily: 'monospace', fontSize: 12 }}>
                            <span>{user.serial_key}</span>
                            <button 
                              onClick={() => copySerial(user.serial_key)} 
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Copiar serial"
                            >
                              {copiedId === user.serial_key ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {isUserOwner ? (
                            <span style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: 700, fontSize: 11, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                              DONO
                            </span>
                          ) : isPremium ? (
                            <span style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600, fontSize: 11, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                              PREMIUM
                            </span>
                          ) : (
                            <span style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 11 }}>
                              FREE
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: isActive ? '#10b981' : 'var(--danger-color)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? '#10b981' : 'var(--danger-color)' }}></span>
                            {isActive ? 'Ativo' : 'Suspenso'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          {isUserOwner || isPremium ? 'Ilimitado' : '1 formulário'}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {isUserOwner ? (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Acesso Total</span>
                          ) : (
                            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                              <button
                                onClick={() => handleTogglePlan(user)}
                                disabled={actionLoading === user.email}
                                className="btn btn-outline"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: 12,
                                  gap: 6,
                                  background: isPremium ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.15)',
                                  borderColor: isPremium ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                                  color: isPremium ? 'var(--danger-color)' : '#10b981'
                                }}
                              >
                                {isPremium ? 'Mudar para Free' : 'Tornar Premium'}
                              </button>

                              <button
                                onClick={() => handleToggleStatus(user)}
                                disabled={actionLoading === user.email}
                                className="btn btn-outline"
                                style={{ padding: '6px 10px', fontSize: 12 }}
                                title={isActive ? 'Suspender usuário' : 'Reativar usuário'}
                              >
                                {isActive ? 'Suspender' : 'Reativar'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
