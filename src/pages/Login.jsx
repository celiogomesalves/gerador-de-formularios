import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login({ setSession }) {
  const [error, setError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const hasDriveAccess = tokenResponse.scope && tokenResponse.scope.includes('drive.file');
      if (!hasDriveAccess) {
        setError('⚠️ Você precisa marcar a caixinha permitindo o acesso ao Google Drive para podermos salvar os formulários!');
        return;
      }
      const expiry = Date.now() + (tokenResponse.expires_in * 1000);
      localStorage.setItem('google_access_token', tokenResponse.access_token);
      localStorage.setItem('google_token_expiry', expiry.toString());
      
      let user = null;
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { "Authorization": `Bearer ${tokenResponse.access_token}` }
        });
        if (userInfoRes.ok) {
          user = await userInfoRes.json();
          localStorage.setItem('google_user_profile', JSON.stringify(user));
        }
      } catch (err) {
        console.error("Erro ao buscar perfil do usuário:", err);
      }

      setSession({ access_token: tokenResponse.access_token, user });
    },
    onError: (error) => setError('Falha no login com Google: ' + error.message),
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    prompt: 'consent'
  });

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Background ambient liquid blobs */}
      <div className="liquid-blob" style={{ width: '600px', height: '600px', top: '-10%', left: '-10%', background: 'rgba(96, 165, 250, 0.6)', animationDuration: '20s' }}></div>
      <div className="liquid-blob" style={{ width: '500px', height: '500px', bottom: '-20%', right: '-5%', background: 'rgba(139, 92, 246, 0.4)', animationDuration: '25s' }}></div>
      
      <div className="login-card animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Sparkles size={48} style={{ color: 'var(--accent-color)', marginBottom: 20, filter: 'drop-shadow(0 0 16px rgba(96, 165, 250, 0.5))' }} />
          <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>FormGen Studio</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Crie formulÃ¡rios premium salvos diretamente no seu Drive.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: 16, borderRadius: 12, fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 32, background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <input 
            type="checkbox" 
            id="terms" 
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            style={{ marginTop: 2, width: 18, height: 18, accentColor: 'var(--accent-color)', cursor: 'pointer' }}
          />
          <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Eu concordo com os <Link to="/terms" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>Termos de ServiÃ§o</Link> e a <Link to="/privacy" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>PolÃ­tica de Privacidade</Link>.
          </label>
        </div>

        <button 
          type="button" 
          className="btn btn-outline" 
          disabled={!termsAccepted}
          style={{ 
            width: '100%', 
            padding: '16px', 
            fontSize: 15, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 12, 
            alignItems: 'center', 
            cursor: termsAccepted ? 'pointer' : 'not-allowed',
            opacity: termsAccepted ? 1 : 0.5,
            borderRadius: 16
          }}
          onClick={() => termsAccepted && login()}
        >
          <img src="https://www.google.com/favicon.ico" width={20} alt="Google" style={{ objectFit: 'contain', filter: termsAccepted ? 'none' : 'grayscale(100%) opacity(0.7)' }} />
          Continuar com Google
        </button>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link 
            to="/manual" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              color: 'var(--text-secondary)', 
              fontSize: 13, 
              textDecoration: 'none',
              padding: '8px 18px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-builder)',
              transition: 'all 0.2s ease'
            }}
          >
            <BookOpen size={15} color="var(--accent-color)" /> Manual & Documentação do Sistema
          </Link>
        </div>
      </div>
    </div>
  );
}


