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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-builder)' }}>
      {/* Sidebar Nav */}
      <aside className="sidebar" style={{ width: 280, padding: '24px 20px', borderRight: '1px solid var(--border-builder)', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-color)' }} /> FormGen Studio
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="tab-btn active" style={{ background: '#f1f5f9', color: 'var(--text-main)' }}>
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
      <main style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>Dashboard</h1>
              <p style={{ color: 'var(--text-muted)' }}>Gerencie seus formulários sincronizados com o Google Drive.</p>
            </div>
            <button className="btn btn-primary" onClick={createNewForm} disabled={loading}>
              <Plus size={18} /> Criar Novo Formulário
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px' }}>Carregando seus formulários do Drive...</div>
          ) : forms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 16, border: '1px dashed var(--border-builder)' }}>
              <FileText size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Nenhum formulário criado</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Você ainda não criou nenhum formulário no seu Drive.</p>
              <button className="btn btn-primary" onClick={createNewForm}>Criar Meu Primeiro Form</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {forms.map(form => (
                <div key={form.token} style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid var(--border-builder)', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{form.title}</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, display: 'flex', gap: 12 }}>
                    <span>Google Drive</span>
                    <span>•</span>
                    <span>{form.date}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ flex: '1 1 45%', padding: '8px', fontSize: 13 }} onClick={() => navigate(`/builder/${form.token}`)}>
                      <Edit size={14} /> Editar
                    </button>
                    <button className="btn btn-outline" style={{ flex: '1 1 45%', padding: '8px', fontSize: 13 }} onClick={() => window.open(`/f/${form.token}`, '_blank')}>
                      <ExternalLink size={14} /> Ver Ao Vivo
                    </button>
                    <button className="btn btn-outline" style={{ flex: '1 1 45%', padding: '8px', fontSize: 13 }} onClick={() => duplicateForm(form.token)}>
                      <Copy size={14} /> Duplicar
                    </button>
                    <button className="btn btn-outline" style={{ flex: '1 1 45%', padding: '8px', fontSize: 13, color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => deleteForm(form.token)}>
                      <Trash2 size={14} /> Excluir
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
