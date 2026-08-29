import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function WhatsAppButton() {
  const location = useLocation();
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    fetch('/api/subscription?action=get_config')
      .then(res => res.json())
      .then(data => {
        if (data && data.whatsappSupportUrl) {
          setWhatsappUrl(data.whatsappSupportUrl);
        }
      })
      .catch(err => console.error('Erro ao buscar link do WhatsApp:', err));
  }, []);

  // Do not render on public form respondent view (/f/:token)
  if (location.pathname.startsWith('/f/')) {
    return null;
  }

  const handleClick = () => {
    if (!whatsappUrl) {
      alert('O canal de suporte via WhatsApp está sendo configurado pelo administrador. Em breve estará disponível!');
      return;
    }

    let targetUrl = whatsappUrl.trim();
    const digitsOnly = targetUrl.replace(/\D/g, '');
    if (!targetUrl.startsWith('http')) {
      const fullNumber = digitsOnly.startsWith('55') ? digitsOnly : `55${digitsOnly}`;
      targetUrl = `https://wa.me/${fullNumber}?text=${encodeURIComponent('Olá! Preciso de suporte com o FormGen Studio.')}`;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'auto'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip / Label pill */}
      <div 
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          padding: '8px 14px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          border: '1px solid rgba(37, 211, 102, 0.3)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          transform: hovered ? 'translateX(0) scale(1)' : 'translateX(10px) scale(0.95)',
          opacity: hovered ? 1 : 0,
          pointerEvents: 'none',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          whiteSpace: 'nowrap'
        }}
      >
        Suporte via WhatsApp
      </div>

      {/* WhatsApp FAB Button */}
      <button
        onClick={handleClick}
        title="Falar com o Suporte no WhatsApp"
        style={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(37, 211, 102, 0.45)',
          color: '#fff',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: hovered ? 'scale(1.08)' : 'scale(1)'
        }}
      >
        {/* Official WhatsApp SVG Icon */}
        <svg 
          viewBox="0 0 32 32" 
          width="30" 
          height="30" 
          fill="currentColor"
        >
          <path d="M16 2a13.9 13.9 0 0 0-12 21L2 30l7.2-1.9A13.9 13.9 0 1 0 16 2zm0 25.5a11.5 11.5 0 0 1-5.9-1.6l-.4-.3-4.4 1.1 1.2-4.3-.3-.4A11.6 11.6 0 1 1 16 27.5zm6.4-8.6c-.3-.2-2-.1-2.3-.9s-.7-.7-1-.7-.6 0-.9.4-1.2 1.5-1.5 1.8-.6.3-1 .1a12.6 12.6 0 0 1-3.7-2.3 14 14 0 0 1-2.6-3.2c-.2-.4 0-.6.2-.8l.6-.7.4-.6a.9.9 0 0 0 0-.8c-.1-.2-.9-2.2-1.2-3s-.6-.7-.9-.7h-.7a1.4 1.4 0 0 0-1 .5 4.3 4.3 0 0 0-1.3 3.2 7.6 7.6 0 0 0 1.6 4.1 17.5 17.5 0 0 0 6.7 5.9c.9.4 1.7.7 2.3.9a5.5 5.5 0 0 0 2.5.2 4.1 4.1 0 0 0 2.7-1.9 3.4 3.4 0 0 0 .2-1.9c-.2-.1-.6-.2-.9-.3z"/>
        </svg>
      </button>
    </div>
  );
}
