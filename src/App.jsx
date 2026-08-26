import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Builder from './pages/Builder';
import PublicForm from './pages/PublicForm';
import Home from './pages/Home';
import Login from './pages/Login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

const CLIENT_ID = '599672910369-t21nh7tf2junorrn7p81orl1mjc8hefn.apps.googleusercontent.com';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('google_access_token');
    const expiry = localStorage.getItem('google_token_expiry');
    
    if (savedToken && expiry && Date.now() < parseInt(expiry)) {
      setSession({ access_token: savedToken });
    } else {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_token_expiry');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Carregando...</div>;
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <Login setSession={setSession} />} />
        <Route path="/" element={session ? <Home session={session} setSession={setSession} /> : <Navigate to="/login" />} />
        <Route path="/builder/:token" element={session ? <Builder session={session} /> : <Navigate to="/login" />} />
        <Route path="/f/:token" element={<PublicForm />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
