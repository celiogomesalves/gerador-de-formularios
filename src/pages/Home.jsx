import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Layout, FileText, LogOut, Sparkles, ExternalLink, Edit, Trash2, Copy } from 'lucide-react';
import { getOrCreateFolder, listForms, deleteFormFromDrive, getFormFromDrive, saveFormToDrive } from '../lib/googleDrive';

export default function Home({ session, setSession }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folderId, setFolderId] = useState(null);
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
        // We can't know fieldsCount without downloading the whole file, so we'll hide it or show placeholder
        fieldsCount: '?'
      }));
      
      setForms(formattedForms);
    } catch (e) {
      console.error('Error loading forms from Drive', e);
      alert('Erro ao carregar do Google Drive. Tente fazer login novamente.');
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormsFromDrive();
  }, [token]);

  const createNewForm = () => {
    // We navigate to a new special route, or just generate a local uuid 
    // that won't match a drive ID, indicating it's "new"
    const newToken = `new_${uuidv4()}`;
    navigate(`/builder/${newToken}`);
  };

  const deleteForm = async (fileId) => {
    if (window.confirm('Tem certeza que deseja excluir este formulário do seu Google Drive?')) {
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
      // Download the original form
      const data = await getFormFromDrive(token, fileId);
      
      if (data.design && data.design.titleText) {
        data.design.titleText = `${data.design.titleText} (Cópia)`;
      }
      
      // Save as a new file in Drive
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
    <div style={{ display: 'flex', height: '100vh' }} className="dashboard-bg">
      {/* Sidebar Nav */}
      <aside className="sidebar" style={{ width: 280, padding: '24px 20px', borderRight: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 40, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          <Sparkles size={22} style={{ color: 'var(--accent-color)' }} /> FormGen Studio
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="tab-btn active" style={{ background: '#ffffff', color: 'var(--accent-color)', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
            <Layout size={18} /> Meus Formulários
          </button>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="tab-btn" onClick={handleLogout} style={{ color: 'var(--danger-color)' }}>
            <LogOut size={18} /> Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div className="glass-header">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6, letterSpacing: '-0.02em' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Gerencie seus formulários sincronizados com o Google Drive.</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px', fontSize: 15, borderRadius: '12px', boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.4)' }} onClick={createNewForm} disabled={loading}>
            <Plus size={20} /> Criar Novo Formulário
          </button>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 60px 48px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: '3px solid rgba(2, 132, 199, 0.2)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <div style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 500 }}>Sincronizando com o Google Drive...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : forms.length === 0 ? (
            <div className="dashboard-card" style={{ textAlign: 'center', padding: '80px 24px', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2 }}>
              <FileText size={64} style={{ color: '#cbd5e1', margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Nenhum formulário criado</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32, maxWidth: 400 }}>Você ainda não criou nenhum formulário. Comece agora mesmo e sincronize com seu Drive.</p>
              <button className="btn btn-primary" onClick={createNewForm} style={{ width: 'auto', padding: '12px 32px', borderRadius: 12 }}>Criar Meu Primeiro Form</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
              {forms.map((form, index) => (
                <div key={form.token} className="dashboard-card" style={{ animationDelay: `${index * 0.08}s` }}>
                  <div style={{ marginBottom: 'auto' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)', lineHeight: 1.3 }}>{form.title}</h3>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src="https://www.google.com/drive/static/images/drive/logo-drive.png" height="14" alt="Drive" /> Google Drive
                      </span>
                      <span style={{ opacity: 0.3 }}>•</span>
                      <span>{form.date}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ flex: '1 1 calc(50% - 6px)', padding: '10px', fontSize: 14, borderRadius: 10 }} onClick={() => navigate(`/builder/${form.token}`)}>
                      <Edit size={16} /> Editar
                    </button>
                    <button className="btn btn-outline" style={{ flex: '1 1 calc(50% - 6px)', padding: '10px', fontSize: 14, borderRadius: 10, borderColor: 'rgba(0,0,0,0.1)' }} onClick={() => window.open(`/f/${form.token}`, '_blank')}>
                      <ExternalLink size={16} /> Ver Ao Vivo
                    </button>
                    <button className="btn btn-outline" style={{ flex: '1 1 calc(50% - 6px)', padding: '10px', fontSize: 14, borderRadius: 10, borderColor: 'rgba(0,0,0,0.1)' }} onClick={() => duplicateForm(form.token)}>
                      <Copy size={16} /> Duplicar
                    </button>
                    <button className="btn btn-outline" style={{ flex: '1 1 calc(50% - 6px)', padding: '10px', fontSize: 14, borderRadius: 10, color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }} onClick={() => deleteForm(form.token)}>
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
