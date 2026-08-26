import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Sparkles } from 'lucide-react';

export default function Login({ setSession }) {
  const [error, setError] = useState(null);

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

          <button 
            type="button" 
            className="btn btn-outline" 
            style={{ width: '100%', padding: '12px', fontSize: 15, background: '#ffffff', color: '#333', borderColor: '#e2e8f0', display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center', cursor: 'pointer' }}
            onClick={() => login()}
          >
            <img src="https://www.google.com/favicon.ico" width={20} alt="Google" style={{ objectFit: 'contain' }} />
            Continuar com Google
          </button>
        </div>
      </div>
    </div>
  );
}
