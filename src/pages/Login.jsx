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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-builder)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <div style={{ background: '#ffffff', width: '100%', maxWidth: 420, padding: 40, borderRadius: 24, boxShadow: '0 12px 32px rgba(0,0,0,0.03)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Sparkles size={40} style={{ color: 'var(--accent-color)', marginBottom: 16 }} />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>FormGen Studio</h1>
            <p style={{ color: 'var(--text-muted)' }}>Faça login com Google para salvar formulários no seu Drive.</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24 }}>
            <input 
              type="checkbox" 
              id="terms" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ marginTop: 4, width: 16, height: 16, accentColor: 'var(--accent-color)' }}
            />
            <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Eu concordo com os <Link to="/terms" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Termos de Serviço</Link> e a <Link to="/privacy" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Política de Privacidade</Link>.
            </label>
          </div>

          <button 
            type="button" 
            className="btn btn-outline" 
            disabled={!termsAccepted}
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: 15, 
              background: '#ffffff', 
              color: '#333', 
              borderColor: '#e2e8f0', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 10, 
              alignItems: 'center', 
              cursor: termsAccepted ? 'pointer' : 'not-allowed',
              opacity: termsAccepted ? 1 : 0.6
            }}
            onClick={() => termsAccepted && login()}
          >
            <img src="https://www.google.com/favicon.ico" width={20} alt="Google" style={{ objectFit: 'contain', filter: termsAccepted ? 'none' : 'grayscale(100%)' }} />
            Continuar com Google
          </button>
        </div>
      </div>
    </div>
  );
}
