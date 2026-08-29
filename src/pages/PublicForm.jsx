import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';

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
  const [errors, setErrors] = useState({});
  const [systemToast, setSystemToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'warning', title = '') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setSystemToast({ message, type, title });
    toastTimeoutRef.current = setTimeout(() => {
      setSystemToast(null);
    }, 4500);
  };

  const clearFieldError = (fieldId) => {
    if (errors[fieldId]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validateFields = (fieldsToValidate) => {
    const form = document.getElementById('public-form');
    if (!form) return true;

    const newErrors = {};
    let firstInvalidField = null;

    for (const field of fieldsToValidate) {
      if (!field.required) continue;

      if (field.type === 'checkbox_group') {
        const checkboxes = form.querySelectorAll(`input[name="${field.key}"]`);
        const hasChecked = Array.from(checkboxes).some(cb => cb.checked);
        if (!hasChecked) {
          newErrors[field.id] = 'Selecione ao menos uma opção para continuar.';
          if (!firstInvalidField) firstInvalidField = field;
        }
      } else if (field.type === 'checkbox') {
        const cb = form.querySelector(`input[name="${field.key}"]`);
        if (!cb || !cb.checked) {
          newErrors[field.id] = 'Você precisa marcar esta opção para continuar.';
          if (!firstInvalidField) firstInvalidField = field;
        }
      } else if (field.type === 'radio') {
        const radios = form.querySelectorAll(`input[name="${field.key}"]`);
        const hasChecked = Array.from(radios).some(r => r.checked);
        if (!hasChecked) {
          newErrors[field.id] = 'Por favor, selecione uma das opções acima.';
          if (!firstInvalidField) firstInvalidField = field;
        }
      } else if (field.type === 'select') {
        const select = form.querySelector(`select[name="${field.key}"]`);
        if (!select || !select.value) {
          newErrors[field.id] = 'Por favor, selecione uma opção na lista.';
          if (!firstInvalidField) firstInvalidField = field;
        }
      } else if (field.type === 'email') {
        const input = form.querySelector(`input[name="${field.key}"]`);
        const val = input ? input.value.trim() : '';
        if (!val) {
          newErrors[field.id] = 'Por favor, preencha este campo obrigatório.';
          if (!firstInvalidField) firstInvalidField = field;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          newErrors[field.id] = 'Por favor, insira um e-mail válido.';
          if (!firstInvalidField) firstInvalidField = field;
        }
      } else {
        const input = form.querySelector(`[name="${field.key}"]`);
        const val = input ? input.value.trim() : '';
        if (!val) {
          newErrors[field.id] = 'Por favor, preencha este campo obrigatório.';
          if (!firstInvalidField) firstInvalidField = field;
        }
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));

    if (firstInvalidField) {
      showToast('Por favor, preencha os campos obrigatórios assinalados.', 'warning', 'Atenção');
      const el = document.getElementById(`group_${firstInvalidField.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

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
      minHeight: '100dvh',
      width: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: transparentBgParam ? '10px' : '32px 16px 80px 16px',
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
      padding: '40px 28px',
      width: '100%',
      maxWidth: '540px',
      margin: '0 auto',
      marginBottom: '40px',
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

    // Validação exclusiva do sistema
    if (config && config.fields) {
      const isValid = validateFields(config.fields);
      if (!isValid) {
        if (isMultistep) {
          const firstErrField = config.fields.find(f => {
            const form = e.target;
            if (!f.required) return false;
            if (f.type === 'checkbox_group') {
              const cbs = form.querySelectorAll(`input[name="${f.key}"]`);
              return !Array.from(cbs).some(cb => cb.checked);
            }
            if (f.type === 'checkbox') {
              const cb = form.querySelector(`input[name="${f.key}"]`);
              return !cb || !cb.checked;
            }
            if (f.type === 'radio') {
              const rs = form.querySelectorAll(`input[name="${f.key}"]`);
              return !Array.from(rs).some(r => r.checked);
            }
            if (f.type === 'select') {
              const sel = form.querySelector(`select[name="${f.key}"]`);
              return !sel || !sel.value;
            }
            const inp = form.querySelector(`[name="${f.key}"]`);
            return !inp || !inp.value.trim();
          });
          if (firstErrField) {
            const stepIdx = config.fields.findIndex(f => f.id === firstErrField.id);
            if (stepIdx !== -1) setCurrentStep(stepIdx);
          }
        }
        return;
      }
    }

    setSubmitting(true);
    
    const formData = new FormData(e.target);
    const data = {};
    const urlParams = new URLSearchParams(window.location.search);

    // Inicializar todos os campos definidos no construtor com os tipos corretos
    if (config && config.fields) {
      config.fields.forEach(field => {
        const payloadKey = field.label || field.key;
        if (field.type === 'checkbox') {
          data[payloadKey] = false; // Checkbox único inicia booleano
        } else if (field.type === 'checkbox_group') {
          data[payloadKey] = []; // Múltipla escolha inicia como Array vazio
        } else {
          data[payloadKey] = ''; // Outros iniciam string vazia
        }
      });
    }

    for (let [key, value] of formData.entries()) {
      const fieldConfig = config.fields?.find(f => f.key === key);
      const payloadKey = fieldConfig && fieldConfig.label ? fieldConfig.label : key;
      
      if (fieldConfig && fieldConfig.type === 'checkbox') {
        data[payloadKey] = true;
      } else if (fieldConfig && fieldConfig.type === 'checkbox_group') {
        if (!Array.isArray(data[payloadKey])) {
          data[payloadKey] = [];
        }
        data[payloadKey].push(value);
      } else {
        if (data[payloadKey] && data[payloadKey] !== '') {
          data[payloadKey] = data[payloadKey] + ", " + value;
        } else {
          data[payloadKey] = value;
        }
      }
    }

    // Metadados estruturados para automações (n8n, Make, Zapier)
    const queryParamsObj = {};
    for (const [key, value] of urlParams.entries()) {
      queryParamsObj[key] = value;
    }
    data.submittedAt = new Date().toISOString();
    if (Object.keys(queryParamsObj).length > 0) {
      data.formQueryParameters = queryParamsObj;
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
      showToast('Não foi possível enviar suas respostas: ' + (err.message || 'Tente novamente.'), 'error', 'Erro no Envio');
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
      <style>{`
        @keyframes slideDownToast {
          from { opacity: 0; transform: translate(-50%, -24px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeInError {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast exclusivo do sistema */}
      {systemToast && (
        <div 
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            width: '90%',
            maxWidth: 420,
            backgroundColor: config.design.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${systemToast.type === 'error' ? '#ef4444' : systemToast.type === 'warning' ? '#f59e0b' : '#10b981'}`,
            borderRadius: `${Math.max(Number(config.design.borderRadius) || 8, 8)}px`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            animation: 'slideDownToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            color: config.design.mode === 'dark' ? '#f8fafc' : '#0f172a'
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: systemToast.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : systemToast.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: systemToast.type === 'error' ? '#ef4444' : systemToast.type === 'warning' ? '#f59e0b' : '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {systemToast.title && (
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                {systemToast.title}
              </div>
            )}
            <div style={{ fontSize: 12.5, opacity: 0.9, lineHeight: 1.4 }}>
              {systemToast.message}
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setSystemToast(null)}
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              color: 'inherit',
              opacity: 0.5,
              borderRadius: 4,
              display: 'flex'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {config.design.customCss && (
        <style dangerouslySetInnerHTML={{ __html: config.design.customCss }} />
      )}
      <div className="public-form-container" style={getPageWrapperStyle()}>
      <div className="public-form-card" style={getCardStyle()}>
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
            <form onSubmit={handleSubmit} id="public-form" noValidate>
              {config.fields.map((field, index) => {
                const isFieldActive = !isMultistep || index === currentStep;
                const fieldError = errors[field.id];
                return (
                <div 
                  key={field.id} 
                  id={`group_${field.id}`}
                  className={`public-form-group ${fieldError ? 'has-error' : ''}`}
                  style={{ display: isFieldActive ? 'block' : 'none' }}
                >
                  <label className="public-form-label" style={{ color: config.design.headerTextColor ? config.design.headerTextColor : (config.design.mode === 'dark' ? '#cbd5e1' : '#374151') }}>
                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      name={field.key}
                      placeholder={field.placeholder}
                      className="public-form-input"
                      rows="4"
                      onChange={() => clearFieldError(field.id)}
                      style={{
                        backgroundColor: config.design.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                        color: config.design.mode === 'dark' ? '#f8fafc' : '#0f172a',
                        borderColor: fieldError ? '#ef4444' : (config.design.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'),
                        boxShadow: fieldError ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : undefined,
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
                        onChange={() => clearFieldError(field.id)}
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
                      className="public-form-input"
                      onChange={() => clearFieldError(field.id)}
                      style={{
                        backgroundColor: config.design.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                        color: config.design.mode === 'dark' ? '#f8fafc' : '#0f172a',
                        borderColor: fieldError ? '#ef4444' : (config.design.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'),
                        boxShadow: fieldError ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : undefined,
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
                            onChange={() => clearFieldError(field.id)}
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
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 8, 
                      marginTop: 4,
                      ...(fieldError ? { 
                        border: '1px solid rgba(239, 68, 68, 0.4)', 
                        padding: '10px 12px', 
                        borderRadius: 8, 
                        background: 'rgba(239, 68, 68, 0.03)' 
                      } : {})
                    }}>
                      {(field.options || ['Opção 1']).map((opt, i) => {
                        const isExclusive = (field.exclusiveOptions || []).includes(opt);
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input 
                              type="checkbox" 
                              name={field.key} 
                              id={`${field.id}_${i}`}
                              value={opt}
                              defaultChecked={isExclusive}
                              style={{ width: 16, height: 16, accentColor: config.design.themeColor }}
                              onChange={(e) => {
                                clearFieldError(field.id);
                                const isExc = (field.exclusiveOptions || []).includes(opt);
                                const container = e.target.closest('div').parentElement;
                                if (e.target.checked) {
                                  if (isExc) {
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
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      name={field.key}
                      placeholder={field.placeholder}
                      className="public-form-input"
                      onChange={() => clearFieldError(field.id)}
                      style={{
                        backgroundColor: config.design.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                        color: config.design.mode === 'dark' ? '#f8fafc' : '#0f172a',
                        borderColor: fieldError ? '#ef4444' : (config.design.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'),
                        boxShadow: fieldError ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : undefined,
                        borderRadius: `${config.design.borderRadius}px`,
                        colorScheme: config.design.mode === 'dark' ? 'dark' : 'light',
                        '--focus-ring-color': config.design.themeColor
                      }}
                    />
                  )}

                  {fieldError && (
                    <div 
                      style={{ 
                        color: '#ef4444', 
                        fontSize: 12, 
                        fontWeight: 500, 
                        marginTop: 6, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 5,
                        animation: 'fadeInError 0.2s ease'
                      }}
                    >
                      <AlertCircle size={13} style={{ flexShrink: 0 }} />
                      <span>{fieldError}</span>
                    </div>
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
                        const currentField = config.fields[currentStep];
                        if (currentField) {
                          const isValid = validateFields([currentField]);
                          if (!isValid) return;
                        }
                        setCurrentStep(prev => prev + 1);
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
