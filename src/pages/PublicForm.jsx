import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function PublicForm() {
  const { token } = useParams();
  const [config, setConfig] = useState({
    fields: [],
    design: {
      showHeader: true,
      logoUrl: '',
      logoAlignment: 'center',
      logoSize: 'medium',
      titleText: 'Preencha os dados',
      subtitleText: 'Por favor, insira as informações nos campos abaixo.',
      headerTextColor: '',

      bgType: 'preset',
      solidBgColor: '#f8fafc',
      gradientType: 'linear',
      gradientColorStart: '#0284c7',
      gradientColorEnd: '#0369a1',
      gradientAngle: 135,
      presetTheme: 'corporate',

      themeColor: '#0284c7',
      mode: 'light',
      cardStyle: 'solid',
      borderRadius: 8,
      shadowSize: 'sm',
      fontFamily: 'Plus Jakarta Sans',
    },
    settings: { 
      destinationType: 'webhook',
      webhookUrl: '', 
      successMessage: 'Formulário enviado com sucesso!',
      sheetsUrl: '',
      sheetsTabName: 'Página1',
      emailDest: '',
      emailSubject: 'Novo envio de formulário',
      emailProvider: 'formgen',
      supabaseUrl: '',
      supabaseAnonKey: '',
      supabaseTable: 'submissions',
    }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [success, setSuccess] = useState(false);

  // Parse embed query params
  const searchParams = new URLSearchParams(window.location.search);
  const hideHeaderParam = searchParams.get('header') === '0';
  const transparentBgParam = searchParams.get('bg') === 'transparent';
  const dbUrl = searchParams.get('db');
  const dbKey = searchParams.get('key');

  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
    const loadConfig = async () => {
      try {
        if (isPreview) {
          const storedForm = localStorage.getItem(`form_${token}`);
          if (storedForm) {
            const parsedData = JSON.parse(storedForm);
            setConfig({
              fields: parsedData.fields || [],
              design: { ...config.design, ...parsedData.design },
              settings: { ...config.settings, ...parsedData.settings }
            });
            setLoading(false);
            return;
          }
        }

        let loaded = false;

        // 1. Fetch form data via serverless proxy /api/form
        try {
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const apiUrl = `/api/form?id=${encodeURIComponent(token)}&t=${Date.now()}`;
          const response = await fetch(apiUrl);
          if (response.ok) {
            const parsedData = await response.json();
            if (parsedData && (parsedData.fields || parsedData.design)) {
              setConfig({
                fields: parsedData.fields || [],
                design: { ...config.design, ...parsedData.design },
                settings: { ...config.settings, ...parsedData.settings }
              });
              loaded = true;
            }
          }
        } catch (apiErr) {
          console.warn('API /api/form fetch failed, trying fallbacks:', apiErr);
        }

        // 2. Fallback to localStorage (e.g. for offline/local drafts)
        if (!loaded) {
          const storedForm = localStorage.getItem(`form_${token}`);
          if (storedForm) {
            const parsedData = JSON.parse(storedForm);
            setConfig({
              fields: parsedData.fields || [],
              design: { ...config.design, ...parsedData.design },
              settings: { ...config.settings, ...parsedData.settings }
            });
            loaded = true;
          }
        }
        
        if (!loaded) {
          throw new Error('Not found in any source');
        }
      } catch (e) {
        console.error("Erro ao ler configuração do formulário:", e);
        // Mock fallback
        setConfig(prev => ({
          ...prev,
          fields: [
            { id: '1', key: 'email', type: 'email', required: true, label: 'E-mail', placeholder: 'Seu melhor e-mail' },
            { id: '2', key: 'nome', type: 'text', required: true, label: 'Nome Completo', placeholder: 'Seu nome e sobrenome' }
          ]
        }));
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [token]);

  // Adjust iframe size in parent window
  useEffect(() => {
    if (!loading) {
      const handleResize = () => {
        window.parent.postMessage({
          type: 'resize-form',
          token: token,
          height: document.documentElement.scrollHeight || document.body.scrollHeight
        }, '*');
      };
      
      // Wait for font load and rendering
      const timer = setTimeout(handleResize, 200);
      window.addEventListener('resize', handleResize);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [loading, token, success, config]);

  const getPageWrapperStyle = () => {
    const designObj = config.design;
    const styles = {
      minHeight: '100vh',
      height: '100vh',
      width: '100%',
      overflowY: 'auto',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: transparentBgParam ? '10px' : '40px 20px',
      boxSizing: 'border-box',
      transition: 'background 0.3s ease'
    };

    if (transparentBgParam) {
      styles.background = 'transparent';
      styles.padding = '10px';
    } else if (designObj.bgType === 'solid') {
      styles.backgroundColor = designObj.solidBgColor;
    } else if (designObj.bgType === 'preset') {
      const presets = {
        corporate: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
        emerald_business: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        warm_sand: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        minimal: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        cosmic: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        cyberpunk: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #030712 100%)'
      };
      styles.background = presets[designObj.presetTheme] || presets.corporate;
    } else {
      styles.background = `linear-gradient(${designObj.gradientAngle}deg, ${designObj.gradientColorStart} 0%, ${designObj.gradientColorEnd} 100%)`;
    }

    return styles;
  };

  const getCardStyle = () => {
    const designObj = config.design;
    const isDark = designObj.mode === 'dark';
    
    const styles = {
      fontFamily: designObj.fontFamily === 'Inter' ? 'var(--font-inter)' :
                  designObj.fontFamily === 'Outfit' ? 'var(--font-outfit)' :
                  designObj.fontFamily === 'Playfair Display' ? 'var(--font-playfair)' :
                  designObj.fontFamily === 'Montserrat' ? 'var(--font-montserrat)' :
                  designObj.fontFamily === 'Poppins' ? 'var(--font-poppins)' :
                  designObj.fontFamily === 'Lora' ? 'var(--font-lora)' :
                  designObj.fontFamily === 'Space Grotesk' ? 'var(--font-space)' :
                  designObj.fontFamily === 'Cinzel' ? 'var(--font-cinzel)' : 'var(--font-jakarta)',
      borderRadius: `${designObj.borderRadius}px`,
      boxShadow: designObj.shadowSize === 'none' ? 'none' :
                 designObj.shadowSize === 'sm' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' :
                 designObj.shadowSize === 'lg' ? '0 20px 25px -5px rgba(0, 0, 0, 0.2)' :
                 '0 10px 15px -3px rgba(0, 0, 0, 0.1)', // md
      padding: '40px 32px',
      width: '100%',
      maxWidth: '520px',
      margin: 'auto', // Centers the card within the flex-start wrapper when it's shorter than viewport
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid',
      boxSizing: 'border-box'
    };

    if (designObj.cardStyle === 'glassmorphic') {
      styles.backdropFilter = 'blur(16px)';
      styles.WebkitBackdropFilter = 'blur(16px)';
      if (isDark) {
        styles.backgroundColor = designObj.cardBgColor ? designObj.cardBgColor : 'rgba(15, 23, 42, 0.65)';
        styles.borderColor = 'rgba(255, 255, 255, 0.08)';
        styles.color = designObj.headerTextColor ? designObj.headerTextColor : '#f8fafc';
      } else {
        styles.backgroundColor = designObj.cardBgColor ? designObj.cardBgColor : 'rgba(255, 255, 255, 0.7)';
        styles.borderColor = 'rgba(0, 0, 0, 0.06)';
        styles.color = designObj.headerTextColor ? designObj.headerTextColor : '#0f172a';
      }
    } else {
      if (isDark) {
        styles.backgroundColor = designObj.cardBgColor ? designObj.cardBgColor : '#1e293b';
        styles.borderColor = '#334155';
        styles.color = designObj.headerTextColor ? designObj.headerTextColor : '#f8fafc';
      } else {
        styles.backgroundColor = designObj.cardBgColor ? designObj.cardBgColor : '#ffffff';
        styles.borderColor = '#e2e8f0';
        styles.color = designObj.headerTextColor ? designObj.headerTextColor : '#0f172a';
      }
    }

    return styles;
  };

  const getLogoSize = () => {
    const size = parseInt(config.design.logoSize);
    if (!isNaN(size)) return `${size}px`;
    if (config.design.logoSize === 'small') return '40px';
    if (config.design.logoSize === 'large') return '90px';
    return '60px'; // medium
  };

  const getLogoAlignment = () => {
    const align = config.design.logoAlignment;
    if (align === 'left') return 'flex-start';
    if (align === 'right') return 'flex-end';
    return 'center'; // center
  };

  const getHeaderTextColor = () => {
    if (config.design.headerTextColor) return config.design.headerTextColor;
    return config.design.mode === 'dark' ? '#f8fafc' : '#0f172a';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.target);
    const data = {};
    
    // Capturar parâmetros de URL (Query Strings)
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
      data[key] = value;
    }

    // Inicializar todos os campos definidos no construtor para garantir que a chave exista no webhook (útil para n8n/zapier)
    if (config && config.fields) {
      config.fields.forEach(field => {
        const payloadKey = field.label || field.key;
        if (field.type === 'checkbox') {
          data[payloadKey] = false; // Checkbox único inicia falso
        } else {
          data[payloadKey] = ''; // Outros iniciam vazios
        }
      });
    }

    const seenGroupKeys = new Set();

    for (let [key, value] of formData.entries()) {
      const fieldConfig = config.fields?.find(f => f.key === key);
      const payloadKey = fieldConfig && fieldConfig.label ? fieldConfig.label : key;
      
      if (fieldConfig && fieldConfig.type === 'checkbox') {
        data[payloadKey] = true; // Se está no FormData, foi marcado
      } else if (fieldConfig && fieldConfig.type === 'checkbox_group') {
        if (!seenGroupKeys.has(payloadKey)) {
          data[payloadKey] = value;
          seenGroupKeys.add(payloadKey);
        } else {
          data[payloadKey] = data[payloadKey] + ", " + value;
        }
      } else {
        // Se a chave já tiver um valor diferente de string vazia (ex: campos duplicados com mesmo key), concatena
        if (data[payloadKey] && data[payloadKey] !== '') {
          data[payloadKey] = data[payloadKey] + ", " + value;
        } else {
          data[payloadKey] = value;
        }
      }
    }
    
    console.log('Dados submetidos:', data);

    const type = config.settings.destinationType;
    let headers = { 'Content-Type': 'application/json' };
    let body = JSON.stringify(data);

    try {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const proxyUrl = isLocalhost ? 'https://vibeform-studio.vercel.app/api/proxy' : '/api/proxy';

      if (type === 'sheets' && config.settings.sheetsUrl) {
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: config.settings.sheetsUrl,
            method: 'POST',
            body: data
          })
        });
        if (!response.ok) throw new Error(`Google Sheets HTTP Error: ${response.status}`);
      } else if (type === 'webhook' && config.settings.webhookUrl) {
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: config.settings.webhookUrl,
            method: 'POST',
            body: data
          })
        });
        if (!response.ok) throw new Error(`Webhook HTTP Error: ${response.status}`);
      } else if (type === 'supabase') {
        if (!config.settings.supabaseUrl || !config.settings.supabaseAnonKey) {
           throw new Error('As credenciais do Supabase (URL ou Anon Key) não foram configuradas neste formulário.');
        }
        const url = `${config.settings.supabaseUrl}/rest/v1/${config.settings.supabaseTable || 'submissions'}`;
        
        // Match the expected table structure for Supabase (id, form_token, data, created_at)
        const supabaseBody = JSON.stringify({
          form_token: token,
          data: data
        });

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.settings.supabaseAnonKey,
            'Authorization': `Bearer ${config.settings.supabaseAnonKey}`,
            'Prefer': 'return=minimal'
          },
          body: supabaseBody
        });
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`Supabase Error: ${response.status} - ${errData.message || errData.hint || 'Unknown'}`);
        }
      } else if (type === 'email') {
        const emailProxyUrl = isLocalhost ? 'https://vibeform-studio.vercel.app/api/send-email' : '/api/send-email';
        const response = await fetch(emailProxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settings: config.settings,
            formToken: token,
            data: data
          })
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`Email Error: ${response.status} - ${errData.error || 'Failed to send'}`);
        }
      } else {
        await new Promise(r => setTimeout(r, 1200));
      }

      setSuccess(true);
      e.target.reset();
    } catch (err) {
      console.error('Erro ao enviar dados do formulário público:', err);
      alert('Houve um erro ao enviar o formulário. Por favor, tente novamente.\n\nDetalhes: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isMultistep = config?.design?.formMode === 'multistep';

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        color: '#f8fafc',
        fontFamily: 'sans-serif'
      }}>
        Carregando formulário...
      </div>
    );
  }

  return (
    <>
      {config.design.customCss && (
        <style dangerouslySetInnerHTML={{ __html: config.design.customCss }} />
      )}
      <div className="public-form-container" style={getPageWrapperStyle()}>
      <div style={getCardStyle()}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 8px' }}>
            <div style={{ fontSize: 64, marginBottom: 20, filter: 'drop-shadow(0 4px 12px rgba(16,185,129,0.3))' }}>✅</div>
            <h2 style={{ 
              fontSize: 22, 
              fontWeight: 700, 
              marginBottom: 12,
              color: getHeaderTextColor() 
            }}>
              {config.settings.successMessage}
            </h2>
            <p style={{ color: getHeaderTextColor(), opacity: 0.6, fontSize: 14, marginBottom: 24 }}>
              Sua resposta foi registrada e enviada com sucesso.
            </p>
            {config.settings.allowAnotherResponse !== false && (
              <button 
                onClick={() => setSuccess(false)}
                className="public-form-btn"
                style={{
                  background: 'transparent',
                  color: config.design.themeColor,
                  border: `1px solid ${config.design.themeColor}`,
                  display: 'inline-flex',
                  width: 'auto',
                  padding: '10px 24px',
                  borderRadius: `${config.design.borderRadius}px`
                }}
              >
                Enviar outra resposta
              </button>
            )}
          </div>
        ) : (
          <>
            {config.design.showHeader && !hideHeaderParam && (
              <div className="public-form-header">
                {config.design.logoUrl && (
                  <div className="public-form-logo-container" style={{ justifyContent: getLogoAlignment() }}>
                    <img 
                      src={config.design.logoUrl} 
                      alt="Logo do formulário" 
                      style={{ 
                        maxHeight: getLogoSize(), 
                        maxWidth: '100%',
                        borderRadius: '4px' 
                      }} 
                    />
                  </div>
                )}
                
                <h2 className="public-form-title" style={{ color: getHeaderTextColor(), textAlign: config.design.titleAlignment || 'center' }}>
                  {config.design.titleText || 'Preencha os dados'}
                </h2>
                
                {config.design.subtitleText && (
                  <p className="public-form-subtitle" style={{ color: getHeaderTextColor(), opacity: 0.7, textAlign: config.design.subtitleAlignment || 'center' }}>
                    {config.design.subtitleText}
                  </p>
                )}
              </div>
            )}
            
            {isMultistep && config.fields.length > 0 && !success && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: config.design.mode === 'dark' ? '#94a3b8' : '#64748b', marginBottom: 8, fontWeight: 500 }}>
                  <span>Passo {currentStep + 1} de {config.fields.length}</span>
                  <span>{Math.round(((currentStep + 1) / config.fields.length) * 100)}%</span>
                </div>
                <div style={{ height: 6, width: '100%', backgroundColor: config.design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${((currentStep + 1) / config.fields.length) * 100}%`, backgroundColor: config.design.themeColor, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} id="public-form">
              {config.fields.map((field, index) => {
                if (isMultistep && index !== currentStep) return null;
                return (
                <div key={field.id} className="public-form-group">
                  <label className="public-form-label" style={{ color: config.design.headerTextColor ? config.design.headerTextColor : (config.design.mode === 'dark' ? '#cbd5e1' : '#374151') }}>
                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      name={field.key}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="public-form-input"
                      rows="4"
                      style={{
                        backgroundColor: config.design.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                        color: config.design.mode === 'dark' ? '#f8fafc' : '#0f172a',
                        borderColor: config.design.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
                        borderRadius: `${config.design.borderRadius}px`,
                        '--focus-ring-color': config.design.themeColor
                      }}
                    ></textarea>
                  ) : field.type === 'checkbox' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <input 
                        type="checkbox" 
                        name={field.key} 
                        id={field.id}
                        required={field.required}
                        style={{ width: 16, height: 16, accentColor: config.design.themeColor }}
                      />
                      <label 
                        htmlFor={field.id}
                        className="public-form-checkbox-label"
                        style={{ color: config.design.headerTextColor ? config.design.headerTextColor : (config.design.mode === 'dark' ? '#9ca3af' : '#64748b'), cursor: 'pointer', opacity: config.design.headerTextColor ? 0.9 : 1 }}
                      >
                        {field.placeholder || 'Aceito os termos'}
                      </label>
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      name={field.key}
                      required={field.required}
                      className="public-form-input"
                      style={{
                        backgroundColor: config.design.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                        color: config.design.mode === 'dark' ? '#f8fafc' : '#0f172a',
                        borderColor: config.design.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
                        borderRadius: `${config.design.borderRadius}px`,
                        '--focus-ring-color': config.design.themeColor
                      }}
                    >
                      <option value="">Escolha uma opção</option>
                      {(field.options || ['Opção 1']).map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'radio' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                      {(field.options || ['Opção 1']).map((opt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input 
                            type="radio" 
                            name={field.key} 
                            id={`${field.id}_${i}`}
                            value={opt}
                            required={field.required}
                            style={{ width: 16, height: 16, accentColor: config.design.themeColor }}
                          />
                          <label 
                            htmlFor={`${field.id}_${i}`}
                            className="public-form-radio-label"
                            style={{ color: config.design.headerTextColor ? config.design.headerTextColor : (config.design.mode === 'dark' ? '#9ca3af' : '#64748b'), cursor: 'pointer', opacity: config.design.headerTextColor ? 0.9 : 1 }}
                          >
                            {opt}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : field.type === 'checkbox_group' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                      {(field.options || ['Opção 1']).map((opt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input 
                            type="checkbox" 
                            name={field.key} 
                            id={`${field.id}_${i}`}
                            value={opt}
                            style={{ width: 16, height: 16, accentColor: config.design.themeColor }}
                            onChange={(e) => {
                              const isExclusive = (field.exclusiveOptions || []).includes(opt);
                              const container = e.target.closest('div').parentElement;
                              if (e.target.checked) {
                                if (isExclusive) {
                                  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                                    if (cb !== e.target) cb.checked = false;
                                  });
                                } else {
                                  const exclusiveOpts = field.exclusiveOptions || [];
                                  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                                    if (exclusiveOpts.includes(cb.value)) cb.checked = false;
                                  });
                                }
                              }
                            }}
                          />
                          <label 
                            htmlFor={`${field.id}_${i}`}
                            className="public-form-radio-label"
                            style={{ color: config.design.headerTextColor ? config.design.headerTextColor : (config.design.mode === 'dark' ? '#9ca3af' : '#64748b'), cursor: 'pointer', opacity: config.design.headerTextColor ? 0.9 : 1 }}
                          >
                            {opt}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      name={field.key}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="public-form-input"
                      style={{
                        backgroundColor: config.design.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                        color: config.design.mode === 'dark' ? '#f8fafc' : '#0f172a',
                        borderColor: config.design.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
                        borderRadius: `${config.design.borderRadius}px`,
                        colorScheme: config.design.mode === 'dark' ? 'dark' : 'light',
                        '--focus-ring-color': config.design.themeColor
                      }}
                    />
                  )}
                </div>
              );})}
              
              {isMultistep ? (
                <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                  {currentStep > 0 && (
                    <button 
                      type="button" 
                      className="public-form-btn" 
                      onClick={() => setCurrentStep(prev => prev - 1)} 
                      style={{ 
                        flex: 1, 
                        backgroundColor: 'transparent', 
                        color: config.design.mode === 'dark' ? '#fff' : '#000', 
                        border: `1px solid ${config.design.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: `${config.design.borderRadius}px`
                      }}
                    >
                      Voltar
                    </button>
                  )}
                  {currentStep < config.fields.length - 1 ? (
                    <button 
                      type="button" 
                      className="public-form-btn" 
                      onClick={() => {
                        const form = document.getElementById('public-form');
                        if (form.reportValidity()) {
                          setCurrentStep(prev => prev + 1);
                        }
                      }} 
                      style={{ 
                        flex: 1, 
                        backgroundColor: config.design.submitButtonColor || config.design.themeColor, 
                        color: config.design.submitButtonTextColor || '#ffffff',
                        borderRadius: `${config.design.borderRadius}px`
                      }}
                    >
                      Próximo
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="public-form-btn" 
                      style={{ 
                        flex: 1, 
                        backgroundColor: config.design.submitButtonColor || config.design.themeColor, 
                        color: config.design.submitButtonTextColor || '#ffffff', 
                        opacity: submitting ? 0.7 : 1,
                        borderRadius: `${config.design.borderRadius}px`,
                        boxShadow: `0 4px 12px ${config.design.submitButtonColor || config.design.themeColor}40`
                      }}
                    >
                      {submitting ? 'Enviando...' : (config.design.submitButtonText || 'Enviar Dados')}
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="public-form-btn" 
                  style={{ 
                    width: '100%', 
                    marginTop: 16, 
                    backgroundColor: config.design.submitButtonColor || config.design.themeColor, 
                    color: config.design.submitButtonTextColor || '#ffffff',
                    opacity: submitting ? 0.7 : 1,
                    borderRadius: `${config.design.borderRadius}px`,
                    boxShadow: `0 4px 12px ${config.design.submitButtonColor || config.design.themeColor}40`
                  }}
                >
                  {submitting ? 'Enviando...' : (config.design.submitButtonText || 'Enviar Dados')}
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
    </>
  );
}
