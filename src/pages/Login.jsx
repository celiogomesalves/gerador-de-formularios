import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login({ setSession }) {
  const [error, setError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // access_token expires usually in 3599 seconds
      const expiry = Date.now() + (tokenResponse.expires_in * 1000);
      localStorage.setItem('google_access_token', tokenResponse.access_token);
      localStorage.setItem('google_token_expiry', expiry.toString());
      setSession({ access_token: tokenResponse.access_token });
    },
    onError: (error) => setError('Falha no login com Google: ' + error.message),
    scope: 'https://www.googleapis.com/auth/drive.file'
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
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Crie formulários premium salvos diretamente no seu Drive.</p>
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
            Eu concordo com os <Link to="/terms" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>Termos de Serviço</Link> e a <Link to="/privacy" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>Política de Privacidade</Link>.
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
      </div>
    </div>
  );
}
