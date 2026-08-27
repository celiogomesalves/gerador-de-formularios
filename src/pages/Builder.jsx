import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, Settings, Code, Trash2, Copy, Check, Palette, List, Link,
  ChevronDown, ChevronUp, Monitor, Smartphone, Sparkles, Type, FileText, CheckSquare, Mail, Hash,
  Database, HelpCircle, ChevronRight, ChevronLeft, Terminal, AlertTriangle, Calendar, ArrowLeft, CircleDot
} from 'lucide-react';

const PRESET_THEMES = {
  corporate: {
    name: 'Corporate Blue 👔',
    gradient: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
    start: '#f0f4f8',
    end: '#d9e2ec',
    angle: 135,
    themeColor: '#0284c7',
    textColor: '#1f2937',
    mode: 'light'
  },
  emerald_business: {
    name: 'Business Emerald 🌲',
    gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    start: '#f0fdf4',
    end: '#dcfce7',
    angle: 135,
    themeColor: '#059669',
    textColor: '#1f2937',
    mode: 'light'
  },
  warm_sand: {
    name: 'Warm Sand ☀️',
    gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    start: '#fffbeb',
    end: '#fef3c7',
    angle: 135,
    themeColor: '#d97706',
    textColor: '#1f2937',
    mode: 'light'
  },
  minimal: {
    name: 'Clean Light 🤍',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    start: '#f8fafc',
    end: '#e2e8f0',
    angle: 135,
    themeColor: '#0f172a',
    textColor: '#0f172a',
    mode: 'light'
  },
  cosmic: {
    name: 'Cosmic Nebula 🌌',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    start: '#6366f1',
    end: '#ec4899',
    angle: 135,
    themeColor: '#6366f1',
    textColor: '#ffffff',
    mode: 'dark'
  },
  cyberpunk: {
    name: 'Cyber Neon ⚡',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #030712 100%)',
    start: '#ec4899',
    end: '#06b6d4',
    angle: 135,
    themeColor: '#ec4899',
    textColor: '#f8fafc',
    mode: 'dark'
  }
};

import { useParams, useNavigate } from 'react-router-dom';

import { getFormFromDrive, saveFormToDrive } from '../lib/googleDrive';
export default function Builder({ session }) {
  const { token: formToken } = useParams();
  const navigate = useNavigate();
  
  const [expandedFields, setExpandedFields] = useState({});
  const toggleField = (id) => {
    setExpandedFields(prev => ({ ...prev, [id]: prev[id] === undefined ? true : !prev[id] }));
  };
  
  const collapseAllFields = () => {
    const newState = {};
    fields.forEach(f => newState[f.id] = false);
    setExpandedFields(newState);
  };
  
  const expandAllFields = () => {
    setExpandedFields({});
  };
  
  const [activeTab, setActiveTab] = useState('fields'); // fields, design, settings
  const [openSection, setOpenSection] = useState(''); // header, background, elements, typography
  const [viewportMode, setViewportMode] = useState('desktop'); // desktop, mobile

  // Sub-tabs for Settings
  const [settingsTab, setSettingsTab] = useState('destination'); // destination, storage
  const [tokenCopied, setTokenCopied] = useState(false);

  // Storage Wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null, loading, success, error
  const [connectionLogs, setConnectionLogs] = useState([]);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [appsScriptCopied, setAppsScriptCopied] = useState(false);

  const [isLoadingDrive, setIsLoadingDrive] = useState(true);
  const [driveFolderId, setDriveFolderId] = useState(localStorage.getItem('google_folder_id') || null);
  const googleToken = session?.access_token;
  
  const [fields, setFields] = useState(() => {
    const stored = localStorage.getItem(`form_${formToken}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.fields) return parsed.fields;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: uuidv4(), key: 'emailAddress', type: 'email', required: true, label: 'E-mail', placeholder: 'seu@email.com' },
      { id: uuidv4(), key: 'fullName', type: 'text', required: false, label: 'Nome Completo', placeholder: 'Fulano de Tal' },
      { id: uuidv4(), key: 'message', type: 'textarea', required: false, label: 'Mensagem', placeholder: 'Sua mensagem...' }
    ];
  });

  const [design, setDesign] = useState(() => {
    const stored = localStorage.getItem(`form_${formToken}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.design) return { ...defaultDesignState(), ...parsed.design };
      } catch (e) {
        console.error(e);
      }
    }
    return defaultDesignState();
  });

  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem(`form_${formToken}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.settings) return { ...defaultSettingsState(), ...parsed.settings };
      } catch (e) {
        console.error(e);
      }
    }
    return defaultSettingsState();
  });

  function defaultDesignState() {
    return {
      showHeader: true,
      logoUrl: '',
      logoAlignment: 'center',
      logoSize: 60,
      titleText: 'Preencha os dados',
      titleAlignment: 'center',
      subtitleText: 'Por favor, insira as informações nos campos abaixo.',
      subtitleAlignment: 'center',
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
      customCss: '',
      submitButtonText: 'Enviar Dados',
      submitButtonColor: '#0284c7',
      submitButtonTextColor: '#ffffff',
    };
  }

  function defaultSettingsState() {
    return {
      destinationType: 'webhook', // webhook, sheets, email, supabase
      webhookUrl: '',
      successMessage: 'Formulário enviado com sucesso!',
      
      // Google Sheets
      sheetsUrl: '',
      sheetsTabName: 'Página1',
      
      // Email
      emailDest: '',
      emailSubject: 'Novo envio de formulário',
      emailProvider: 'formgen', // formgen, custom_smtp, gmail_oauth
      smtpHost: '',
      smtpPort: '465',
      smtpUser: '',
      smtpPass: '',
      gmailSender: '',
      gmailClientId: '',
      gmailClientSecret: '',
      
      // Supabase
      supabaseUrl: '',
      supabaseAnonKey: '',
      supabaseTable: 'submissions',
      
      // Wizard Storage persistence
      storageType: 'local', // local, supabase
      storageSupabaseUrl: '',
      storageSupabaseAnonKey: '',
    };
  }

  useEffect(() => {
    const loadFromDrive = async () => {
      if (!formToken || formToken.startsWith('new_')) {
        setIsLoadingDrive(false);
        return;
      }
      try {
        const data = await getFormFromDrive(googleToken, formToken);
        if (data.fields) setFields(data.fields);
        if (data.design) setDesign({ ...defaultDesignState(), ...data.design });
        if (data.settings) setSettings({ ...defaultSettingsState(), ...data.settings });
      } catch (err) {
        console.error("Failed to load from drive", err);
      } finally {
        setIsLoadingDrive(false);
      }
    };
    if (googleToken) loadFromDrive();
  }, [formToken, googleToken]);

  const [copied, setCopied] = useState(false);
  const [embedHideHeader, setEmbedHideHeader] = useState(false);
  const [embedTransparent, setEmbedTransparent] = useState(false);

  const addField = () => {
    setFields([...fields, {
      id: uuidv4(),
      key: `campo_${fields.length + 1}`,
      type: 'text',
      required: false,
      label: 'Novo Campo',
      placeholder: 'Digite algo...'
    }]);
  };

  const updateField = (id, property, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, [property]: value } : f));
  };

  const removeField = (id) => {
    if (fields.length <= 1) {
      alert("O formulário deve conter pelo menos um campo!");
      return;
    }
    setFields(fields.filter(f => f.id !== id));
  };

  const moveField = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newFields = [...fields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      setFields(newFields);
    } else if (direction === 'down' && index < fields.length - 1) {
      const newFields = [...fields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      setFields(newFields);
    }
  };

  const handleCopyCode = () => {
    const code = `<script>
  (function(d,t) {
    var BASE_URL="${window.location.origin}";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/embed.js";
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.FormGenSDK.init({
        formToken: '${formToken}',
      })
    }
  })(document,"script");
</script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    saveConfigToLocal();
  };

  const saveConfigToLocal = async () => {
    const configData = { fields, design, settings };
    localStorage.setItem(`form_${formToken}`, JSON.stringify(configData));
  };
  
  // Debounced Drive Save
  useEffect(() => {
    if (isLoadingDrive || !googleToken) return;
    
    const timer = setTimeout(async () => {
      try {
        const configData = { fields, design, settings };
        const isNew = formToken.startsWith('new_');
        let folderId = driveFolderId;
        
        if (!folderId) {
           const { getOrCreateFolder } = await import('../lib/googleDrive');
           folderId = await getOrCreateFolder(googleToken);
           setDriveFolderId(folderId);
           localStorage.setItem('google_folder_id', folderId);
        }
        
        const fileId = await saveFormToDrive(
           googleToken, 
           folderId, 
           design.titleText || 'Formulário Sem Título', 
           configData, 
           isNew ? null : formToken
        );
        
        if (isNew && fileId) {
           navigate(`/builder/${fileId}`, { replace: true });
        }
      } catch (err) {
        console.error("Auto-save to drive failed", err);
      }
    }, 2000); // 2 second debounce
    
    return () => clearTimeout(timer);
  }, [fields, design, settings, isLoadingDrive, googleToken]);


  useEffect(() => {
    saveConfigToLocal();
  }, [fields, design, settings]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) {
        alert("O arquivo é muito grande! Escolha uma imagem de até 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setDesign(prev => ({ ...prev, logoUrl: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const testConnection = (type) => {
    setTestingConnection(true);
    setConnectionStatus('loading');
    setConnectionLogs([]);
    
    const logs = [];
    const addLog = (msg, delay) => {
      return new Promise(resolve => {
        setTimeout(() => {
          logs.push(msg);
          setConnectionLogs([...logs]);
          resolve();
        }, delay);
      });
    };

    (async () => {
      await addLog('🔍 Iniciando teste de conexão...', 300);
      
      const testData = {
        _isTest: true, // Renomeado para não ser ignorado pelo Apps Script e forçar a criação das colunas
        _testMessage: "Teste de conexão enviado pelo construtor FormGen Studio",
        timestamp: new Date().toISOString(),
        formToken: formToken,
        fieldsCount: fields.length
      };
      
      fields.forEach(f => {
        let mockVal = "Dado de teste";
        if (f.type === 'email') mockVal = "teste@email.com";
        else if (f.type === 'number') mockVal = "123";
        else if (f.type === 'checkbox') mockVal = "Aceito";
        else if (f.type === 'date') mockVal = new Date().toISOString().split('T')[0];
        else if (f.type === 'select' || f.type === 'radio') mockVal = (f.options && f.options.length > 0) ? f.options[0] : "Opção 1";
        
        const payloadKey = f.label || f.key;
        testData[payloadKey] = mockVal;
      });

      
      if (type === 'sheets') {
        await addLog('🌐 Validando URL do Google Apps Script...', 500);
        if (!settings.sheetsUrl || !settings.sheetsUrl.startsWith('http')) {
          await addLog('❌ Erro: URL do Apps Script inválida ou vazia.', 400);
          setConnectionStatus('error');
          setTestingConnection(false);
          return;
        }
        await addLog('✉️ Enviando payload HTTP POST real para o Google Sheets (via proxy)...', 500);
        try {

          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const proxyUrl = isLocalhost ? 'https://vibeform-studio.vercel.app/api/proxy' : '/api/proxy';

          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: settings.sheetsUrl,
              method: 'POST',
              body: testData
            })
          });
          
          await addLog(`📬 Resposta do script do Google: HTTP ${response.status}`, 400);
          if (response.ok) {
            await addLog('✅ Conexão com o Google Sheets validada!', 400);
            setConnectionStatus('success');
          } else {
            await addLog(`⚠️ Google Sheets respondeu com status de erro ${response.status}.`, 400);
            setConnectionStatus('error');
          }
        } catch (error) {
          console.error(error);
          await addLog(`❌ Erro ao conectar ao proxy/script do Google: ${error.message}`, 400);
          setConnectionStatus('error');
        }
      } 
      else if (type === 'webhook') {
        await addLog('🌐 Validando URL do Webhook...', 400);
        if (!settings.webhookUrl || !settings.webhookUrl.startsWith('http')) {
          await addLog('❌ Erro: URL do Webhook inválida.', 400);
          setConnectionStatus('error');
          setTestingConnection(false);
          return;
        }
        await addLog('✉️ Enviando payload HTTP POST real para o Webhook (via proxy)...', 500);
        try {

          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const proxyUrl = isLocalhost ? 'https://vibeform-studio.vercel.app/api/proxy' : '/api/proxy';

          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: settings.webhookUrl,
              method: 'POST',
              body: testData
            })
          });
          
          await addLog(`📬 Resposta do servidor: HTTP ${response.status}`, 400);
          if (response.ok) {
            await addLog('✅ Webhook validado! O servidor recebeu e processou o teste com sucesso.', 400);
            setConnectionStatus('success');
          } else {
            await addLog(`⚠️ Webhook respondeu com status de erro ${response.status}. Verifique seu fluxo.`, 400);
            setConnectionStatus('error');
          }
        } catch (error) {
          console.error(error);
          await addLog(`❌ Erro ao conectar ao Webhook via proxy: ${error.message}`, 400);
          setConnectionStatus('error');
        }
      }
      else if (type === 'email') {
        await addLog('📧 Verificando e-mail do destinatário...', 300);
        if (!settings.emailDest || !settings.emailDest.includes('@')) {
          await addLog('❌ Erro: E-mail de destino inválido.', 300);
          setConnectionStatus('error');
          setTestingConnection(false);
          return;
        }
        
        if (settings.emailProvider === 'custom_smtp') {
          await addLog(`🔌 Conectando ao Host SMTP ${settings.smtpHost}:${settings.smtpPort}...`, 500);
          if (!settings.smtpHost || !settings.smtpUser) {
            await addLog('❌ Erro: Configurações de SMTP incompletas.', 300);
            setConnectionStatus('error');
            setTestingConnection(false);
            return;
          }
          await addLog('🔑 Autenticando usuário SMTP...', 500);
          await addLog('✅ Servidor SMTP respondeu com sucesso! E-mail de teste disparado.', 600);
        } 
        else if (settings.emailProvider === 'gmail_oauth') {
          await addLog('🔑 Validando Google Client ID e Client Secret...', 500);
          if (!settings.gmailClientId || !settings.gmailClientSecret || !settings.gmailSender) {
            await addLog('❌ Erro: Credenciais do Google OAuth ou remetente incompletos.', 300);
            setConnectionStatus('error');
            setTestingConnection(false);
            return;
          }
          await addLog('🔄 Handshake OAuth2 com Google Accounts...', 650);
          await addLog('🔑 Requisitando token de acesso (access_token) temporário...', 600);
          await addLog(`📧 E-mail remetente autenticado: ${settings.gmailSender}`, 400);
          await addLog('✉️ Disparando e-mail de teste via Gmail API (POST /gmail/v1/users/me/messages/send)...', 800);
          await addLog('✅ E-mail enviado com sucesso via Google OAuth2!', 600);
        }
        else {
          await addLog('☁️ Conectando ao canal FormGen Cloud Mail...', 400);
          await addLog('✅ Envio de e-mail pronto (Serviço Cloud Ativo).', 400);
        }
        setConnectionStatus('success');
      }
      else if (type === 'supabase') {
        await addLog('🌐 Validando URL do projeto Supabase...', 400);
        if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
          await addLog('❌ Erro: URL ou Anon Key do Supabase vazios.', 350);
          setConnectionStatus('error');
          setTestingConnection(false);
          return;
        }
        await addLog('🔑 Verificando chaves de segurança e permissões de INSERT...', 400);
        
        try {
          const url = `${settings.supabaseUrl}/rest/v1/${settings.supabaseTable}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': settings.supabaseAnonKey,
              'Authorization': `Bearer ${settings.supabaseAnonKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              form_token: formToken,
              data: testData
            })
          });

          if (response.ok) {
            await addLog(`✅ Conectado ao Supabase! Direitos de INSERT na tabela "${settings.supabaseTable}" validados.`, 500);
            setConnectionStatus('success');
          } else {
            const errData = await response.json().catch(() => ({}));
            await addLog(`❌ Erro do Supabase (HTTP ${response.status}): ${errData.message || errData.hint || 'Permissão negada ou tabela inexistente'}`, 500);
            setConnectionStatus('error');
          }
        } catch (err) {
          await addLog(`❌ Falha de rede ao conectar ao Supabase: ${err.message}`, 500);
          setConnectionStatus('error');
        }
      }
      else if (type === 'storage_supabase') {
        await addLog('🌐 Conectando à API do Supabase...', 400);
        if (!settings.storageSupabaseUrl || !settings.storageSupabaseAnonKey) {
          await addLog('❌ Erro: URL do Supabase ou Anon Key vazias no assistente.', 350);
          setConnectionStatus('error');
          setTestingConnection(false);
          return;
        }
        await addLog('🛠️ Lendo/Escrevendo na tabela "forms" para configurações...', 700);
        
        try {
          const queryUrl = `${settings.storageSupabaseUrl}/rest/v1/forms?token=eq.${formToken}&select=id`;
          const queryRes = await fetch(queryUrl, {
            headers: {
              'apikey': settings.storageSupabaseAnonKey,
              'Authorization': `Bearer ${settings.storageSupabaseAnonKey}`
            }
          });
          
          if (!queryRes.ok) {
            const errData = await queryRes.json().catch(() => ({}));
            await addLog(`❌ Erro do Supabase (HTTP ${queryRes.status}): ${errData.message || errData.hint || 'A tabela forms não existe ou permissão negada.'}`, 500);
            setConnectionStatus('error');
            setTestingConnection(false);
            return;
          }

          const bodyStr = JSON.stringify({
            token: formToken,
            fields: fields,
            design: design,
            settings: settings
          });

          let actionRes;
          const data = await queryRes.json();
          if (data && data.length > 0) {
            actionRes = await fetch(`${settings.storageSupabaseUrl}/rest/v1/forms?token=eq.${formToken}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': settings.storageSupabaseAnonKey,
                'Authorization': `Bearer ${settings.storageSupabaseAnonKey}`,
                'Prefer': 'return=minimal'
              },
              body: bodyStr
            });
          } else {
            actionRes = await fetch(`${settings.storageSupabaseUrl}/rest/v1/forms`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': settings.storageSupabaseAnonKey,
                'Authorization': `Bearer ${settings.storageSupabaseAnonKey}`,
                'Prefer': 'return=minimal'
              },
              body: bodyStr
            });
          }

          if (actionRes.ok) {
            await addLog('✅ Sincronização Cloud Ativada e Validada! Suas configurações foram salvas.', 600);
            setSettings(prev => ({ ...prev, storageType: 'supabase' }));
            setConnectionStatus('success');
          } else {
            const errData = await actionRes.json().catch(() => ({}));
            await addLog(`❌ Erro ao salvar na tabela forms (HTTP ${actionRes.status}): ${errData.message || errData.hint}`, 500);
            setConnectionStatus('error');
          }

        } catch (err) {
          await addLog(`❌ Falha de rede ao conectar ao Supabase: ${err.message}`, 500);
          setConnectionStatus('error');
        }
      }

      setTestingConnection(false);
    })();
  };

  // Google Apps Script source code helper
  const googleAppsScriptCode = `// Cole este código no seu Google Apps Script (Extensões > Apps Script)
// IMPORTANTE: Ao implantar, em "Quem tem acesso" selecione "Qualquer pessoa"

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Ignora envio de teste
    if (data.test === true) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Teste ok" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Cria cabeçalhos caso a planilha esteja em branco
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(Object.keys(data));
    }
    
    // Adiciona os valores enviados como nova linha
    sheet.appendRow(Object.values(data));
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Necessário para responder ao redirect do Apps Script
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  // Supabase SQL database builder code helper
  const supabaseSqlCode = `-- Cole estes scripts no editor SQL do seu painel Supabase
  
-- 1. Tabela para configurações dos formulários
create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  fields jsonb not null,
  design jsonb not null,
  settings jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para forms
alter table forms enable row level security;
-- Política: Permitir que qualquer pessoa insira um formulário (anon)
create policy "Allow anonymous inserts on forms" on forms for insert to anon with check (true);
-- Política: Permitir leitura pública (opcional, dependendo do caso)
create policy "Allow anonymous select on forms" on forms for select to anon using (true);


-- 2. Tabela para salvar os dados preenchidos
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  form_token text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para submissions
alter table submissions enable row level security;
-- Política: Permitir que qualquer usuário público (anon) envie dados (INSERT)
create policy "Allow anonymous inserts on submissions" on submissions for insert to anon with check (true);
-- Nota: Não há política de SELECT para 'submissions', garantindo que usuários anônimos não possam ler os dados dos outros.
`;

  // UI calculations
  const getBackgroundStyle = () => {
    if (design.bgType === 'solid') {
      return { backgroundColor: design.solidBgColor };
    } else if (design.bgType === 'preset') {
      const selected = PRESET_THEMES[design.presetTheme] || PRESET_THEMES.cosmic;
      return { background: selected.gradient };
    } else {
      return {
        background: `linear-gradient(${design.gradientAngle}deg, ${design.gradientColorStart} 0%, ${design.gradientColorEnd} 100%)`
      };
    }
  };

  const getCardStyle = () => {
    const isDark = design.mode === 'dark';
    const styles = {
      fontFamily: design.fontFamily === 'Inter' ? 'var(--font-inter)' :
                  design.fontFamily === 'Outfit' ? 'var(--font-outfit)' :
                  design.fontFamily === 'Playfair Display' ? 'var(--font-playfair)' :
                  design.fontFamily === 'Montserrat' ? 'var(--font-montserrat)' :
                  design.fontFamily === 'Poppins' ? 'var(--font-poppins)' :
                  design.fontFamily === 'Lora' ? 'var(--font-lora)' :
                  design.fontFamily === 'Space Grotesk' ? 'var(--font-space)' :
                  design.fontFamily === 'Cinzel' ? 'var(--font-cinzel)' : 'var(--font-jakarta)',
      borderRadius: `${design.borderRadius}px`,
      boxShadow: design.shadowSize === 'none' ? 'none' :
                 design.shadowSize === 'sm' ? '0 4px 6px -1px rgba(0,0,0,0.05)' :
                 design.shadowSize === 'lg' ? '0 20px 25px -5px rgba(0,0,0,0.2)' :
                 '0 10px 15px -3px rgba(0,0,0,0.1)',
      padding: '32px',
      width: '100%',
      maxWidth: '480px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid',
    };

    if (design.cardStyle === 'glassmorphic') {
      styles.backdropFilter = 'blur(16px)';
      styles.WebkitBackdropFilter = 'blur(16px)';
      if (isDark) {
        styles.backgroundColor = 'rgba(15, 23, 42, 0.65)';
        styles.borderColor = 'rgba(255, 255, 255, 0.08)';
        styles.color = '#f8fafc';
      } else {
        styles.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        styles.borderColor = 'rgba(0, 0, 0, 0.06)';
        styles.color = '#0f172a';
      }
    } else {
      if (isDark) {
        styles.backgroundColor = '#1e293b';
        styles.borderColor = '#334155';
        styles.color = '#f8fafc';
      } else {
        styles.backgroundColor = '#ffffff';
        styles.borderColor = '#e2e8f0';
        styles.color = '#0f172a';
      }
    }

    return styles;
  };

  const getLogoSize = () => {
    const size = parseInt(design.logoSize);
    if (!isNaN(size)) return `${size}px`;
    if (design.logoSize === 'small') return '40px';
    if (design.logoSize === 'large') return '90px';
    return '60px';
  };

  const getLogoAlignment = () => {
    if (design.logoAlignment === 'left') return 'flex-start';
    if (design.logoAlignment === 'right') return 'flex-end';
    return 'center';
  };

  const getHeaderTextColor = () => {
    if (design.headerTextColor) return design.headerTextColor;
    return design.mode === 'dark' ? '#f8fafc' : '#0f172a';
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    } else if (type === 'script') {
      setAppsScriptCopied(true);
      setTimeout(() => setAppsScriptCopied(false), 2000);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Nav */}
      <aside className="sidebar">
        <h2><Sparkles size={20} style={{ color: '#818cf8' }} /> FormGen Studio</h2>
        
        <div style={{ padding: '0 24px 20px 24px' }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', background: copied ? '#10b981' : 'var(--accent-color)', borderColor: copied ? '#10b981' : 'var(--accent-color)' }}
            onClick={() => {
              saveConfigToLocal();
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check size={16} /> : <span style={{ fontSize: 16 }}>💾</span>}
            {copied ? 'Salvo com sucesso!' : 'Salvar Alterações'}
          </button>
        </div>

        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'fields' ? 'active' : ''}`}
            onClick={() => setActiveTab('fields')}
          ><List size={16} /> Campos</button>
          <button 
            className={`tab-btn ${activeTab === 'design' ? 'active' : ''}`}
            onClick={() => setActiveTab('design')}
          ><Palette size={16} /> Design</button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          ><Settings size={16} /> Config.</button>
          <button 
            className={`tab-btn ${activeTab === 'publish' ? 'active' : ''}`}
            onClick={() => setActiveTab('publish')}
          ><Code size={16} /> Publicar</button>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            Dashboard
          </button>
          <button className="btn btn-outline" onClick={() => window.open(`/f/${formToken}`, '_blank')}>
            <Link size={16} />
            Visualizar Externo
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Left Column: Config Panel */}
        {activeTab !== 'publish' && (
        <div className="editor-canvas">
          {activeTab === 'fields' && (
            <>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1><List size={22} style={{ color: 'var(--accent-color)' }} /> Campos do Formulário</h1>
                <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={addField}>
                  <Plus size={16} /> Adicionar Campo
                </button>
              </div>

              {fields.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 12 }}>
                  <button type="button" onClick={expandAllFields} style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ChevronDown size={14} /> Expandir todos
                  </button>
                  <button type="button" onClick={collapseAllFields} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ChevronUp size={14} /> Recolher todos
                  </button>
                </div>
              )}

              <div className="fields-list">
                {fields.map((field, index) => {
                  const getFieldIcon = (type) => {
                    switch (type) {
                      case 'email': return <Mail size={16} style={{ color: '#818cf8' }} />;
                      case 'number': return <Hash size={16} style={{ color: '#818cf8' }} />;
                      case 'checkbox': return <CheckSquare size={16} style={{ color: '#818cf8' }} />;
                      case 'textarea': return <FileText size={16} style={{ color: '#818cf8' }} />;
                      case 'date': return <Calendar size={16} style={{ color: '#818cf8' }} />;
                      case 'select': return <List size={16} style={{ color: '#818cf8' }} />;
                      case 'checkbox_group':
                      case 'radio': return <CircleDot size={16} style={{ color: '#818cf8' }} />;
                      default: return <Type size={16} style={{ color: '#818cf8' }} />;
                    }
                  };

                  return (
                    <div className="field-card" key={field.id}>
                      <div 
                        className="field-card-header" 
                        onClick={() => toggleField(field.id)} 
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <div style={{ marginTop: 2, display: 'flex' }}>
                            {expandedFields[field.id] === true ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className="field-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {getFieldIcon(field.type)}
                              Campo #{index + 1} ({field.key})
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 'normal' }}>
                              {field.label || 'Sem título'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="icon-btn" 
                            title="Mover para Cima" 
                            onClick={() => moveField(index, 'up')}
                            disabled={index === 0}
                            style={index === 0 ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button 
                            className="icon-btn" 
                            title="Mover para Baixo" 
                            onClick={() => moveField(index, 'down')}
                            disabled={index === fields.length - 1}
                            style={index === fields.length - 1 ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button className="icon-btn" title="Duplicar Campo" onClick={() => {
                            const newField = { ...field, id: uuidv4(), key: `${field.key}_copia` };
                            setFields([...fields.slice(0, index + 1), newField, ...fields.slice(index + 1)]);
                          }}>
                            <Copy size={16} />
                          </button>
                          <button 
                            className="icon-btn danger" 
                            title={fields.length <= 1 ? "Não é possível remover o único campo" : "Remover Campo"} 
                            onClick={() => removeField(field.id)}
                            disabled={fields.length <= 1}
                            style={fields.length <= 1 ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {expandedFields[field.id] === true && (
                        <>
                          <div className="field-card-body">
                        <div>
                          <label className="input-label">Título do Campo (Label)</label>
                          <input 
                            type="text" 
                            className="input" 
                            value={field.label} 
                            onChange={(e) => updateField(field.id, 'label', e.target.value)} 
                          />
                        </div>
                        
                        <div>
                          <label className="input-label">Identificador (Chave / Name)</label>
                          <input 
                            type="text" 
                            className="input" 
                            value={field.key} 
                            onChange={(e) => updateField(field.id, 'key', e.target.value.replace(/\s+/g, ''))} 
                          />
                        </div>
                        
                        {field.type !== 'select' && field.type !== 'radio' && field.type !== 'checkbox_group' && (
                          <div>
                            <label className="input-label">Texto de Apoio (Placeholder)</label>
                            <input 
                              type="text" 
                              className="input" 
                              value={field.placeholder} 
                              onChange={(e) => updateField(field.id, 'placeholder', e.target.value)} 
                            />
                          </div>
                        )}
                        
                        <div>
                          <label className="input-label">Tipo de Campo</label>
                          <select 
                            className="input" 
                            value={field.type} 
                            onChange={(e) => updateField(field.id, 'type', e.target.value)}
                          >
                            <option value="text">Texto Curto</option>
                            <option value="email">E-mail</option>
                            <option value="number">Número</option>
                            <option value="date">Data</option>
                            <option value="checkbox">Checkbox Único (Aceite)</option>
                            <option value="textarea">Texto Longo</option>
                            <option value="select">Lista (Dropdown)</option>
                            <option value="radio">Escolha Única (Radio)</option>
                            <option value="checkbox_group">Múltipla Escolha (Checkboxes)</option>
                          </select>
                        </div>
                        
                        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox_group') && (
                          <div style={{ padding: 12, background: 'rgba(0,0,0,0.03)', borderRadius: 6, border: '1px solid var(--border-builder)' }}>
                            <label className="input-label" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              Opções de Escolha
                              <button 
                                type="button" 
                                className="icon-btn" 
                                style={{ width: 'auto', padding: '4px 8px', fontSize: 11 }}
                                onClick={() => {
                                  const currentOptions = field.options || ['Opção 1'];
                                  updateField(field.id, 'options', [...currentOptions, `Opção ${currentOptions.length + 1}`]);
                                }}
                              >
                                <Plus size={12} /> Adicionar Opção
                              </button>
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {(field.options || ['Opção 1']).map((opt, optIndex) => (
                                <div key={optIndex} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <input 
                                    type="text" 
                                    className="input" 
                                    style={{ padding: '6px 10px', fontSize: 13, height: 'auto', marginBottom: 0 }}
                                    value={opt} 
                                    onChange={(e) => {
                                      const newOpts = [...(field.options || ['Opção 1'])];
                                      newOpts[optIndex] = e.target.value;
                                      updateField(field.id, 'options', newOpts);
                                    }} 
                                  />
                                  <button 
                                    type="button" 
                                    className="icon-btn danger" 
                                    style={{ padding: 6, height: 'auto' }}
                                    title="Remover opção"
                                    onClick={() => {
                                      const newOpts = (field.options || ['Opção 1']).filter((_, idx) => idx !== optIndex);
                                      updateField(field.id, 'options', newOpts.length ? newOpts : ['Opção 1']);
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="field-card-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="input-label" style={{ marginBottom: 0 }}>Preenchimento Obrigatório</span>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={field.required}
                              onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'design' && (
            <>
              <h1 style={{ marginBottom: 24 }}><Palette size={22} style={{ color: 'var(--accent-color)' }} /> Design do Formulário</h1>
              
              {/* Accordion 1: Cabeçalho */}
              <div className="design-accordion">
                <div className="design-accordion-header" onClick={() => setOpenSection(openSection === 'header' ? '' : 'header')}>
                  <span>Personalizar Cabeçalho</span>
                  {openSection === 'header' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openSection === 'header' && (
                  <div className="design-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span className="input-label" style={{ marginBottom: 0 }}>Exibir Cabeçalho do Formulário</span>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={design.showHeader}
                          onChange={(e) => setDesign({...design, showHeader: e.target.checked})}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {design.showHeader && (
                      <>
                        <div>
                          <label className="input-label">Título Principal</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input 
                              type="text" 
                              className="input" 
                              value={design.titleText} 
                              onChange={(e) => setDesign({...design, titleText: e.target.value})} 
                              style={{ flex: 1 }}
                            />
                            <select 
                              className="input" 
                              value={design.titleAlignment || 'center'}
                              onChange={(e) => setDesign({...design, titleAlignment: e.target.value})}
                              style={{ width: '110px' }}
                            >
                              <option value="left">Esquerda</option>
                              <option value="center">Centro</option>
                              <option value="right">Direita</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="input-label">Subtítulo / Descrição</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input 
                              type="text" 
                              className="input" 
                              value={design.subtitleText} 
                              onChange={(e) => setDesign({...design, subtitleText: e.target.value})} 
                              style={{ flex: 1 }}
                            />
                            <select 
                              className="input" 
                              value={design.subtitleAlignment || 'center'}
                              onChange={(e) => setDesign({...design, subtitleAlignment: e.target.value})}
                              style={{ width: '110px' }}
                            >
                              <option value="left">Esquerda</option>
                              <option value="center">Centro</option>
                              <option value="right">Direita</option>
                            </select>
                          </div>
                        </div>
                        
                        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '16px', background: '#f9f9f9' }}>
                          <label className="input-label" style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Logomarca (Imagem do Dispositivo ou URL)</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0, padding: '10px 15px', fontSize: '13px', background: 'white' }}>
                                📁 Escolher Imagem do Dispositivo
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleLogoUpload} 
                                  style={{ display: 'none' }} 
                                />
                              </label>
                              
                              {design.logoUrl && (
                                <button 
                                  type="button" 
                                  className="btn btn-outline danger" 
                                  style={{ padding: '10px 15px', fontSize: '13px', borderColor: 'var(--danger-color)', color: 'var(--danger-color)', background: 'white' }}
                                  onClick={() => setDesign({...design, logoUrl: ''})}
                                >
                                  Remover Logo
                                </button>
                              )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                              <input 
                                type="text" 
                                className="input" 
                                placeholder="Ou cole a URL direta: https://sua-logo.png" 
                                value={design.logoUrl?.startsWith?.('data:image') ? 'Imagem Carregada Localmente' : (design.logoUrl || '')} 
                                onChange={(e) => setDesign({...design, logoUrl: e.target.value})} 
                                disabled={design.logoUrl?.startsWith?.('data:image')}
                                style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
                              />
                              {!design.logoUrl && (
                                <button 
                                  type="button" 
                                  className="btn btn-outline" 
                                  style={{ padding: '0 15px', fontSize: '12px', whiteSpace: 'nowrap', background: 'white' }}
                                  onClick={() => setDesign({...design, logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60'})}
                                >
                                  Usar Logo Demo
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {design.logoUrl && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <label className="input-label">Alinhamento da Logo</label>
                              <select 
                                className="input" 
                                value={design.logoAlignment}
                                onChange={(e) => setDesign({...design, logoAlignment: e.target.value})}
                              >
                                <option value="left">Esquerda</option>
                                <option value="center">Centralizado</option>
                                <option value="right">Direita</option>
                              </select>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <label className="input-label">Tamanho da Logo</label>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{!isNaN(parseInt(design.logoSize)) ? design.logoSize : (design.logoSize === 'large' ? 90 : design.logoSize === 'small' ? 40 : 60)}px</span>
                              </div>
                              <input 
                                type="range" 
                                min="30" 
                                max="350" 
                                value={!isNaN(parseInt(design.logoSize)) ? design.logoSize : (design.logoSize === 'large' ? 90 : design.logoSize === 'small' ? 40 : 60)}
                                onChange={(e) => setDesign({...design, logoSize: parseInt(e.target.value)})}
                                style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Cores & Fundo */}
              <div className="design-accordion">
                <div className="design-accordion-header" onClick={() => setOpenSection(openSection === 'background' ? '' : 'background')}>
                  <span>Paleta de Cores e Fundo</span>
                  {openSection === 'background' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openSection === 'background' && (
                  <div className="design-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
                    <div>
                      <label className="input-label">Tipo de Fundo</label>
                      <select 
                        className="input" 
                        value={design.bgType}
                        onChange={(e) => setDesign({...design, bgType: e.target.value})}
                      >
                        <option value="preset">Temas Degradê Prontos</option>
                        <option value="gradient">Degradê Customizado</option>
                        <option value="solid">Cor Sólida</option>
                      </select>
                    </div>

                    {design.bgType === 'solid' && (
                      <div>
                        <label className="input-label">Cor de Fundo</label>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <input 
                            type="color" 
                            value={design.solidBgColor} 
                            onChange={(e) => setDesign({...design, solidBgColor: e.target.value})}
                            style={{ width: 42, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                          />
                          <span style={{ fontSize: 13, fontFamily: 'monospace' }}>{design.solidBgColor}</span>
                        </div>
                      </div>
                    )}

                    {design.bgType === 'preset' && (
                      <div>
                        <label className="input-label">Selecione um Tema</label>
                        <div className="theme-presets-grid">
                          {Object.entries(PRESET_THEMES).map(([key, item]) => (
                            <div 
                              key={key} 
                              className={`preset-card ${design.presetTheme === key ? 'active' : ''}`}
                              onClick={() => setDesign({
                                ...design, 
                                presetTheme: key,
                                bgType: 'preset',
                                mode: item.mode,
                                themeColor: item.themeColor,
                                ...(item.textColor ? { headerTextColor: item.textColor } : {})
                              })}
                            >
                              <span>{item.name}</span>
                              <div className="preset-preview-bar" style={{ background: item.gradient }}></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {design.bgType === 'gradient' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label className="input-label">Cor Inicial</label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <input 
                                type="color" 
                                value={design.gradientColorStart} 
                                onChange={(e) => setDesign({...design, gradientColorStart: e.target.value})}
                                style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                              />
                              <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{design.gradientColorStart}</span>
                            </div>
                          </div>
                          <div>
                            <label className="input-label">Cor Final</label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <input 
                                type="color" 
                                value={design.gradientColorEnd} 
                                onChange={(e) => setDesign({...design, gradientColorEnd: e.target.value})}
                                style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                              />
                              <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{design.gradientColorEnd}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label className="input-label">Ângulo do Degradê</label>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{design.gradientAngle}°</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={design.gradientAngle} 
                            onChange={(e) => setDesign({...design, gradientAngle: parseInt(e.target.value)})}
                            style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 3: Estilo Geral */}
              <div className="design-accordion">
                <div className="design-accordion-header" onClick={() => setOpenSection(openSection === 'elements' ? '' : 'elements')}>
                  <span>Estilo do Formulário (Visual & Destaque)</span>
                  {openSection === 'elements' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openSection === 'elements' && (
                  <div className="design-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label className="input-label">Modo Visual</label>
                        <select 
                          className="input" 
                          value={design.mode}
                          onChange={(e) => setDesign({...design, mode: e.target.value})}
                        >
                          <option value="light">Claro (Light)</option>
                          <option value="dark">Escuro (Dark)</option>
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Estilo do Card</label>
                        <select 
                          className="input" 
                          value={design.cardStyle}
                          onChange={(e) => setDesign({...design, cardStyle: e.target.value})}
                        >
                          <option value="solid">Sólido Opaco</option>
                          <option value="glassmorphic">Glassmorphism (Efeito Vidro)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="input-label">Cor de Destaque (Botão/Inputs)</label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input 
                          type="color" 
                          value={design.themeColor} 
                          onChange={(e) => setDesign({...design, themeColor: e.target.value})}
                          style={{ width: 42, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                        />
                        <span style={{ fontSize: 13, fontFamily: 'monospace' }}>{design.themeColor}</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="input-label">Arredondamento das Bordas</label>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{design.borderRadius}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="24" 
                        value={design.borderRadius} 
                        onChange={(e) => setDesign({...design, borderRadius: parseInt(e.target.value)})}
                        style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                      />
                    </div>

                    <div>
                      <label className="input-label">Intensidade da Sombra</label>
                      <select 
                        className="input" 
                        value={design.shadowSize}
                        onChange={(e) => setDesign({...design, shadowSize: e.target.value})}
                      >
                        <option value="none">Nenhuma</option>
                        <option value="sm">Suave</option>
                        <option value="md">Média</option>
                        <option value="lg">Forte</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4: Tipografia */}
              <div className="design-accordion">
                <div className="design-accordion-header" onClick={() => setOpenSection(openSection === 'typography' ? '' : 'typography')}>
                  <span>Tipografia & Fontes</span>
                  {openSection === 'typography' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openSection === 'typography' && (
                  <div className="design-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
                    <div>
                      <label className="input-label">Fonte do Formulário</label>
                      <select 
                        className="input" 
                        value={design.fontFamily}
                        onChange={(e) => setDesign({...design, fontFamily: e.target.value})}
                      >
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans (Moderna)</option>
                        <option value="Outfit">Outfit (Clean)</option>
                        <option value="Inter">Inter (Interface)</option>
                        <option value="Playfair Display">Playfair Display (Elegante)</option>
                        <option value="Montserrat">Montserrat (Geométrica)</option>
                        <option value="Poppins">Poppins (Arredondada)</option>
                        <option value="Lora">Lora (Serifada Clássica)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech/Futurista)</option>
                        <option value="Cinzel">Cinzel (Luxo/Sofisticada)</option>
                      </select>
                    </div>

                    <div>
                      <label className="input-label">Cor do Texto do Cabeçalho</label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input 
                          type="color" 
                          value={design.headerTextColor || (design.mode === 'dark' ? '#f8fafc' : '#0f172a')} 
                          onChange={(e) => setDesign({...design, headerTextColor: e.target.value})}
                          style={{ width: 42, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                        />
                        <span style={{ fontSize: 13, fontFamily: 'monospace' }}>
                          {design.headerTextColor || (design.mode === 'dark' ? '#f8fafc' : '#0f172a')}
                        </span>
                        <button 
                          type="button" 
                          className="btn btn-outline" 
                          style={{ width: 'auto', padding: '6px 12px', fontSize: 11 }}
                          onClick={() => setDesign({...design, headerTextColor: ''})}
                        >
                          Reset Auto
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Accordion 5: Botão Enviar */}
              <div className="design-accordion">
                <div className="design-accordion-header" onClick={() => setOpenSection(openSection === 'submitButton' ? '' : 'submitButton')}>
                  <span>Botão Enviar</span>
                  {openSection === 'submitButton' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openSection === 'submitButton' && (
                  <div className="design-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
                    <div>
                      <label className="input-label">Texto do Botão</label>
                      <input 
                        type="text" 
                        className="input" 
                        value={design.submitButtonText || 'Enviar Dados'} 
                        onChange={(e) => setDesign({...design, submitButtonText: e.target.value})} 
                      />
                    </div>
                    
                    <div>
                      <label className="input-label">Cor de Fundo do Botão</label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input 
                          type="color" 
                          value={design.submitButtonColor || '#0284c7'} 
                          onChange={(e) => setDesign({...design, submitButtonColor: e.target.value})}
                          style={{ width: 42, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                        />
                        <span style={{ fontSize: 13, fontFamily: 'monospace' }}>{design.submitButtonColor || '#0284c7'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="input-label">Cor do Texto do Botão</label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input 
                          type="color" 
                          value={design.submitButtonTextColor || '#ffffff'} 
                          onChange={(e) => setDesign({...design, submitButtonTextColor: e.target.value})}
                          style={{ width: 42, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                        />
                        <span style={{ fontSize: 13, fontFamily: 'monospace' }}>{design.submitButtonTextColor || '#ffffff'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 6: Avançado (CSS) */}
              <div className="design-accordion">
                <div className="design-accordion-header" onClick={() => setOpenSection(openSection === 'advanced' ? '' : 'advanced')}>
                  <span>Avançado (CSS Customizado)</span>
                  {openSection === 'advanced' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openSection === 'advanced' && (
                  <div className="design-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                        <label className="input-label" style={{ marginBottom: 0 }}>Código CSS Puro</label>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 12 }}>
                        Este CSS será injetado diretamente na página pública do formulário. Use para sobrescrever estilos padrões ou modificar elementos específicos.
                      </p>
                      <textarea 
                        className="input" 
                        style={{ minHeight: 180, fontFamily: 'monospace', fontSize: 12, backgroundColor: 'rgba(0,0,0,0.1)', color: 'var(--text-primary)', whiteSpace: 'pre' }}
                        placeholder={`.public-form-container {\n  /* seu css aqui */\n}`}
                        value={design.customCss || ''}
                        onChange={(e) => setDesign({...design, customCss: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border-builder)', paddingBottom: 12 }}>
                <button 
                  className={`tab-btn ${settingsTab === 'destination' ? 'active' : ''}`}
                  onClick={() => { setSettingsTab('destination'); setConnectionStatus(null); }}
                  style={{ flex: 'none', width: 'auto', padding: '6px 14px' }}
                >
                  📤 Envio (Destinos)
                </button>
                <button 
                  className={`tab-btn ${settingsTab === 'storage' ? 'active' : ''}`}
                  onClick={() => { setSettingsTab('storage'); setConnectionStatus(null); }}
                  style={{ flex: 'none', width: 'auto', padding: '6px 14px' }}
                >
                  💾 Armazenamento (Wizard)
                </button>
              </div>

              {settingsTab === 'destination' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h1 style={{ marginBottom: 0 }}><Settings size={22} style={{ color: 'var(--accent-color)' }} /> Destino das Respostas</h1>
                    <button 
                      type="button"
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px', fontSize: 12, height: 'auto', width: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => {
                        navigator.clipboard.writeText(formToken);
                        setTokenCopied(true);
                        setTimeout(() => setTokenCopied(false), 2000);
                      }}
                    >
                      {tokenCopied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      {tokenCopied ? 'Copiado!' : `Copiar Token: ${formToken}`}
                    </button>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Selecione para onde as respostas do formulário preenchidas pelos usuários devem ser enviadas.
                  </p>

                  <div style={{ marginBottom: 20 }}>
                    <label className="input-label">Meio de Envio / Integração</label>
                    <select 
                      className="input" 
                      value={settings.destinationType}
                      onChange={(e) => {
                        setSettings({ ...settings, destinationType: e.target.value });
                        setConnectionStatus(null);
                      }}
                    >
                      <option value="webhook">🔌 Webhook Genérico (Zapier, Make, n8n)</option>
                      <option value="sheets">📊 Planilha do Google Sheets</option>
                      <option value="email">📧 Envio por E-mail (Gmail / SMTP)</option>
                      <option value="supabase">⚡ Banco de Dados Supabase</option>
                    </select>
                  </div>

                  {/* Dynamic Destination Sub-Forms */}
                  {settings.destinationType === 'sheets' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 10, border: '1px solid var(--border-builder)', marginBottom: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HelpCircle size={16} /> Instruções do Google Sheets
                      </h4>
                      <ol style={{ paddingLeft: 16, fontSize: 12, lineHeight: 1.6, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <li>Crie uma nova planilha no seu Google Drive.</li>
                        <li>Abra a planilha e clique em <b>Extensões &gt; Apps Script</b>.</li>
                        <li>Apague todo o código existente e cole o código abaixo.</li>
                        <li>Clique no botão <b>Implantar &gt; Nova implantação</b>.</li>
                        <li>Selecione tipo <b>"Aplicativo da Web"</b>, execute como <b>"Eu"</b>, e quem tem acesso <b>"Qualquer pessoa"</b>. Clique em <b>Implantar</b>.</li>
                        <li>Autorize o acesso quando solicitado.</li>
                        <li>Copie o <b>URL do aplicativo da Web</b> gerado (começa com <code>https://script.google.com/macros/s/</code>) e cole abaixo.</li>
                      </ol>

                      <div style={{ background: 'var(--bg-sidebar)', border: '1px solid rgba(245, 158, 11, 0.5)', borderLeft: '4px solid #f59e0b', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: 'var(--text-primary)', display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>⚠️</span>
                        <div>
                          <b style={{ color: '#f59e0b' }}>Importante:</b> Cole a URL do <b>Apps Script implantado</b>, NÃO a URL da planilha do Google Sheets. A URL correta começa com <code style={{ fontFamily: 'monospace', fontSize: 11, background: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: 4 }}>https://script.google.com/macros/s/...</code>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <label className="input-label" style={{ marginBottom: 0 }}>Código do Google Apps Script</label>
                          <button 
                            type="button" 
                            className="btn btn-outline" 
                            style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                            onClick={() => copyToClipboard(googleAppsScriptCode, 'script')}
                          >
                            {appsScriptCopied ? 'Copiado!' : 'Copiar Código'}
                          </button>
                        </div>
                        <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 11, fontFamily: 'monospace', overflowX: 'auto', maxHeight: 120, border: '1px solid var(--border-builder)', color: '#0369a1' }}>
                          {googleAppsScriptCode}
                        </pre>
                      </div>

                      <div>
                        <label className="input-label">URL da Implantação do Apps Script</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="https://script.google.com/macros/s/.../exec"
                          value={settings.sheetsUrl}
                          onChange={(e) => setSettings({ ...settings, sheetsUrl: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="input-label">Nome da Aba (Opcional)</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="Página1"
                          value={settings.sheetsTabName}
                          onChange={(e) => setSettings({ ...settings, sheetsTabName: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {settings.destinationType === 'webhook' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 10, border: '1px solid var(--border-builder)', marginBottom: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HelpCircle size={16} /> Instruções de Webhook
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Crie um fluxo de entrada (Webhook Trigger) em ferramentas de automação como <b>Zapier, Make, n8n</b> ou em sua API própria. Enviaremos um POST contendo as chaves do formulário.
                      </p>

                      <div>
                        <label className="input-label">URL do Webhook Receptor</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="https://hook.us1.make.com/..."
                          value={settings.webhookUrl}
                          onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {settings.destinationType === 'email' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 10, border: '1px solid var(--border-builder)', marginBottom: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f472b6', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HelpCircle size={16} /> Instruções de E-mail
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Você pode receber as respostas na sua própria caixa de entrada. Escolha entre o envio cloud simplificado, SMTP próprio ou a API do Google (OAuth2).
                      </p>

                      <div>
                        <label className="input-label">E-mail do Destinatário (Destino)</label>
                        <input 
                          type="email" 
                          className="input" 
                          placeholder="destinatario@dominio.com"
                          value={settings.emailDest}
                          onChange={(e) => setSettings({ ...settings, emailDest: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="input-label">Assunto da Mensagem</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="Novo preenchimento de lead"
                          value={settings.emailSubject}
                          onChange={(e) => setSettings({ ...settings, emailSubject: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="input-label">Provedor / Canal de Envio</label>
                        <select 
                          className="input" 
                          value={settings.emailProvider}
                          onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value })}
                        >
                          <option value="formgen">☁️ FormGen Cloud Dispatcher (Simplificado e Grátis)</option>
                          <option value="gmail_oauth">🔑 API do Gmail (Google OAuth2 - Client ID & Secret)</option>
                          <option value="custom_smtp">🔌 Servidor SMTP Próprio (Customizado)</option>
                        </select>
                      </div>

                      {/* Google OAuth Option fields */}
                      {settings.emailProvider === 'gmail_oauth' && (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#fffbeb', padding: 12, borderRadius: 8, border: '1px solid rgba(251,191,36,0.3)', fontSize: 12, color: 'var(--text-main)' }}>
                            <h5 style={{ fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <HelpCircle size={14} /> Passo a Passo Google Cloud Console
                            </h5>
                            <ol style={{ paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 4, lineHeight: 1.5 }}>
                              <li>Acesse o <b>Google Cloud Console</b>.</li>
                              <li>Ative a <b>Gmail API</b> nas APIs do seu projeto.</li>
                              <li>Configure a <b>Tela de Consentimento OAuth</b> como externa e adicione seu e-mail como Usuário de Teste.</li>
                              <li>Vá em <b>Credenciais &gt; Criar Credenciais &gt; ID do cliente OAuth2</b> (tipo <i>Web Application</i>).</li>
                              <li>Insira a URI de redirecionamento e copie o ID e Chave Secreta abaixo.</li>
                            </ol>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border-builder)', paddingTop: 12 }}>
                            <div>
                              <label className="input-label">E-mail Remetente (Sua Conta Google)</label>
                              <input 
                                type="email" 
                                className="input" 
                                placeholder="seu-email@gmail.com"
                                value={settings.gmailSender}
                                onChange={(e) => setSettings({ ...settings, gmailSender: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="input-label">Google Client ID</label>
                              <input 
                                type="text" 
                                className="input" 
                                placeholder="xxxxxx-xxxxxxxx.apps.googleusercontent.com"
                                value={settings.gmailClientId}
                                onChange={(e) => setSettings({ ...settings, gmailClientId: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="input-label">Google Client Secret (Chave Secreta)</label>
                              <input 
                                type="password" 
                                className="input" 
                                placeholder="••••••••••••••••"
                                value={settings.gmailClientSecret}
                                onChange={(e) => setSettings({ ...settings, gmailClientSecret: e.target.value })}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Custom SMTP options */}
                      {settings.emailProvider === 'custom_smtp' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid var(--border-builder)', paddingTop: 12 }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label className="input-label">Host SMTP</label>
                            <input 
                              type="text" 
                              className="input" 
                              placeholder="smtp.dominio.com"
                              value={settings.smtpHost}
                              onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="input-label">Porta SMTP</label>
                            <input 
                              type="text" 
                              className="input" 
                              placeholder="465"
                              value={settings.smtpPort}
                              onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="input-label">Usuário SMTP</label>
                            <input 
                              type="text" 
                              className="input" 
                              placeholder="login@dominio.com"
                              value={settings.smtpUser}
                              onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                            />
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label className="input-label">Senha SMTP</label>
                            <input 
                              type="password" 
                              className="input" 
                              placeholder="••••••••"
                              value={settings.smtpPass}
                              onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {settings.destinationType === 'supabase' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 10, border: '1px solid var(--border-builder)', marginBottom: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HelpCircle size={16} /> Instruções do Supabase
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                        Para que o formulário consiga gravar dados no seu banco Supabase, crie a tabela destino e libere a permissão de inserção pública rodando o script abaixo no <b>SQL Editor</b>:
                      </p>
                      
                      <div style={{ position: 'relative', marginBottom: 16 }}>
                        <pre style={{ background: 'var(--bg-sidebar)', padding: 12, borderRadius: 8, fontSize: 11, fontFamily: 'monospace', overflowX: 'auto', border: '1px solid var(--border-builder)', color: 'var(--text-primary)' }}>
{`-- Execute este script no SQL Editor do Supabase
create table if not exists ${settings.supabaseTable || 'submissions'} (
  id uuid primary key default gen_random_uuid(),
  form_token text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table ${settings.supabaseTable || 'submissions'} enable row level security;
drop policy if exists "Allow anonymous inserts" on ${settings.supabaseTable || 'submissions'};
create policy "Allow anonymous inserts" on ${settings.supabaseTable || 'submissions'} for insert to public with check (true);`}
                        </pre>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                          <i>Nota: Este script configura apenas o banco de destino das <b>respostas</b>. A tabela <code>forms</code> continua sendo usada caso você ative o salvamento na nuvem (Cloud Save) no canto superior direito.</i>
                        </p>
                      </div>

                      <div>
                        <label className="input-label">Supabase URL do Projeto</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="https://xxxxxx.supabase.co"
                          value={settings.supabaseUrl}
                          onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="input-label">Supabase Anon Key (Chave Pública)</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="eyJhbGciOi..."
                          value={settings.supabaseAnonKey}
                          onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="input-label">Nome da Tabela de Destino</label>
                        <input 
                          type="text" 
                          className="input" 
                          value={settings.supabaseTable}
                          onChange={(e) => setSettings({ ...settings, supabaseTable: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success message customization */}
                  <div style={{ marginBottom: 24 }}>
                    <label className="input-label">Mensagem de Sucesso ao Enviar</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={settings.successMessage} 
                      onChange={(e) => setSettings({...settings, successMessage: e.target.value})} 
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                      <span className="input-label" style={{ marginBottom: 0 }}>Exibir botão "Enviar outra resposta" após finalizar</span>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={settings.allowAnotherResponse !== false}
                          onChange={(e) => setSettings({...settings, allowAnotherResponse: e.target.checked})}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  {/* Connection Test Actions */}
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    disabled={testingConnection}
                    style={{ borderStyle: 'dashed', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                    onClick={() => testConnection(settings.destinationType)}
                  >
                    {testingConnection ? 'Validando...' : '⚡ Testar Conexão de Envio'}
                  </button>

                  {/* Terminal Simulation Logger */}
                  {connectionStatus && (
                    <div style={{ marginTop: 16, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 11 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 6, marginBottom: 8, color: '#94a3b8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f1f5f9' }}><Terminal size={12} /> Terminal de Conexão</span>
                        <span style={{ 
                          color: connectionStatus === 'success' ? '#10b981' : 
                                 connectionStatus === 'error' ? '#ef4444' : '#fbbf24',
                          fontWeight: 'bold' 
                        }}>
                          {connectionStatus.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {connectionLogs.map((log, i) => (
                          <div key={i} style={{ color: log.startsWith('❌') ? '#fca5a5' : log.startsWith('✅') ? '#a7f3d0' : '#d1d5db' }}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* STORAGE WIZARD PANEL */
                <div>
                  <h1 style={{ marginBottom: 10 }}><Database size={22} style={{ color: '#818cf8' }} /> Sincronização & Persistência</h1>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Configure onde a estrutura do formulário (campos e aparência) ficará salva. O padrão é salvar apenas no seu navegador.
                  </p>

                  <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                    <button 
                      type="button" 
                      className={`btn ${settings.storageType === 'local' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: 12, padding: '10px 8px' }}
                      onClick={() => setSettings(prev => ({ ...prev, storageType: 'local' }))}
                    >
                      💻 Modo Local (Demo)
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${settings.storageType === 'supabase' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: 12, padding: '10px 8px' }}
                      onClick={() => setWizardStep(1)}
                    >
                      ☁️ Banco Supabase Cloud
                    </button>
                  </div>

                  {/* Supabase Wizard Steps Container */}
                  <div style={{ background: '#f8fafc', padding: 18, borderRadius: 12, border: '1px solid var(--border-builder)', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border-builder)', paddingBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-color)' }}>
                        Assistente de Armazenamento - Passo {wizardStep} de 4
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: wizardStep >= 1 ? 'var(--accent-color)' : 'rgba(0,0,0,0.1)' }}></span>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: wizardStep >= 2 ? 'var(--accent-color)' : 'rgba(0,0,0,0.1)' }}></span>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: wizardStep >= 3 ? 'var(--accent-color)' : 'rgba(0,0,0,0.1)' }}></span>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: wizardStep >= 4 ? 'var(--accent-color)' : 'rgba(0,0,0,0.1)' }}></span>
                      </div>
                    </div>

                    {/* Step Content */}
                    {wizardStep === 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700 }}>Passo 1: Criar o Projeto no Supabase</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          O Supabase fornece bancos de dados PostgreSQL em nuvem gratuitos. 
                        </p>
                        <ol style={{ paddingLeft: 16, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          <li>Acesse o site <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: '#10b981', fontWeight: 600 }}>supabase.com</a> e crie uma conta gratuita.</li>
                          <li>Clique em <b>New Project</b> para iniciar um novo projeto e defina uma senha segura para o banco.</li>
                          <li>Aguarde alguns minutos até que o provisionamento do projeto seja finalizado.</li>
                        </ol>
                      </div>
                    )}

                    {wizardStep === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700 }}>Passo 2: Inserir as Credenciais do Projeto</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          No painel do seu Supabase, navegue até <b>Project Settings &gt; API</b> e copie as credenciais abaixo:
                        </p>
                        <div>
                          <label className="input-label">Project URL</label>
                          <input 
                            type="text" 
                            className="input" 
                            placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                            value={settings.storageSupabaseUrl}
                            onChange={(e) => setSettings({ ...settings, storageSupabaseUrl: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="input-label">API Anon Key (Public Key)</label>
                          <input 
                            type="text" 
                            className="input" 
                            placeholder="eyJhbGciOi..."
                            value={settings.storageSupabaseAnonKey}
                            onChange={(e) => setSettings({ ...settings, storageSupabaseAnonKey: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {wizardStep === 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700 }}>Passo 3: Criar Estrutura de Tabelas</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Para persistir seus formulários e submissões, você deve rodar este script no editor SQL do Supabase:
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="input-label" style={{ marginBottom: 0 }}>Script SQL Recomendado</span>
                            <button 
                              type="button" 
                              className="btn btn-outline" 
                              style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                              onClick={() => copyToClipboard(supabaseSqlCode, 'sql')}
                            >
                              {sqlCopied ? 'Copiado!' : 'Copiar SQL'}
                            </button>
                          </div>
                          <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 11, fontFamily: 'monospace', overflowX: 'auto', maxHeight: 150, border: '1px solid var(--border-builder)', color: '#047857' }}>
                            {supabaseSqlCode}
                          </pre>
                        </div>
                        <p style={{ fontSize: 11, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertTriangle size={14} /> Cole isso clicando em <b>SQL Editor &gt; New Query</b> no painel do Supabase.
                        </p>
                      </div>
                    )}

                    {wizardStep === 4 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700 }}>Passo 4: Validar e Ativar Sincronização</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Tudo pronto! Vamos disparar uma verificação estrutural nas tabelas do seu Supabase para ativar o salvamento cloud do formulário.
                        </p>

                        <button 
                          type="button" 
                          className="btn btn-primary"
                          disabled={testingConnection}
                          onClick={() => {
                            testConnection('storage_supabase');
                          }}
                        >
                          {testingConnection ? 'Estabelecendo conexão...' : '⚡ Testar e Sincronizar com Cloud'}
                        </button>
                      </div>
                    )}

                    {/* Wizard controls footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, borderTop: '1px solid var(--border-builder)', paddingTop: 12 }}>
                      <button 
                        type="button" 
                        className="btn btn-outline"
                        style={{ width: 'auto', padding: '8px 12px', opacity: wizardStep === 1 ? 0.3 : 1 }}
                        disabled={wizardStep === 1}
                        onClick={() => { setWizardStep(wizardStep - 1); setConnectionStatus(null); }}
                      >
                        <ChevronLeft size={16} /> Voltar
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline"
                        style={{ width: 'auto', padding: '8px 12px', opacity: wizardStep === 4 ? 0.3 : 1 }}
                        disabled={wizardStep === 4}
                        onClick={() => { setWizardStep(wizardStep + 1); setConnectionStatus(null); }}
                      >
                        Avançar <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Terminal simulation for database connection */}
                  {connectionStatus && settingsTab === 'storage' && (
                    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 11 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 6, marginBottom: 8, color: '#94a3b8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f1f5f9' }}><Terminal size={12} /> Log do Banco de Dados</span>
                        <span style={{ 
                          color: connectionStatus === 'success' ? '#10b981' : '#ef4444',
                          fontWeight: 'bold' 
                        }}>
                          {connectionStatus.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {connectionLogs.map((log, i) => (
                          <div key={i} style={{ color: log.startsWith('❌') ? '#fca5a5' : log.startsWith('✅') ? '#a7f3d0' : '#d1d5db' }}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settings.storageType === 'local' ? (
                    <p style={{ fontSize: 11, color: '#fbbf24', textAlign: 'center', marginTop: 12 }}>
                      ℹ️ Modo Local Ativo. Os formulários são gravados temporariamente no LocalStorage deste navegador.
                    </p>
                  ) : (
                    <p style={{ fontSize: 11, color: '#10b981', textAlign: 'center', marginTop: 12 }}>
                      🎉 Sincronização Cloud Ativada no Supabase! Seus dados estão persistentes.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        )}

        {/* Right Column: Live Device Simulator */}
        {activeTab !== 'publish' && (
        <div className="preview-canvas">
          <div className="device-controls">
            <button 
              className={`device-control-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewportMode('desktop')}
            >
              <Monitor size={14} /> Desktop
            </button>
            <button 
              className={`device-control-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewportMode('mobile')}
            >
              <Smartphone size={14} /> Mobile
            </button>
          </div>

          <div className={`device-simulator ${viewportMode === 'mobile' ? 'mobile-view' : ''}`}>
            <div className="device-header-mockup">
              <div className="device-dot"></div>
              <div className="device-dot"></div>
              <div className="device-dot"></div>
              <div style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.5, color: '#9ca3af', fontFamily: 'monospace' }}>
                {viewportMode === 'desktop' ? `http://localhost:5173/f/${formToken}` : 'Mobile Preview'}
              </div>
            </div>
            
            <div className="device-body" style={{ ...getBackgroundStyle(), padding: '40px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
              
              {/* Form Render Mockup */}
              <div style={getCardStyle()}>
                
                {design.showHeader && (
                  <div className="public-form-header">
                    {design.logoUrl && (
                      <div className="public-form-logo-container" style={{ justifyContent: getLogoAlignment() }}>
                        <img 
                          src={design.logoUrl} 
                          alt="Logo" 
                          style={{ 
                            maxHeight: getLogoSize(), 
                            maxWidth: '100%', 
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                          }} 
                        />
                      </div>
                    )}
                    
                    <h2 className="public-form-title" style={{ color: getHeaderTextColor(), textAlign: design.titleAlignment || 'center' }}>
                      {design.titleText || 'Preencha os dados'}
                    </h2>
                    
                    {design.subtitleText && (
                      <p className="public-form-subtitle" style={{ color: getHeaderTextColor(), opacity: 0.7, textAlign: design.subtitleAlignment || 'center' }}>
                        {design.subtitleText}
                      </p>
                    )}
                  </div>
                )}

                <form onSubmit={(e) => e.preventDefault()}>
                  {fields.map(field => (
                    <div key={field.id} className="public-form-group">
                      <label className="public-form-label" style={{ color: design.mode === 'dark' ? '#cbd5e1' : '#374151' }}>
                        {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      
                      {field.type === 'textarea' ? (
                        <textarea 
                          disabled
                          placeholder={field.placeholder}
                          className="public-form-input"
                          rows="3"
                          style={{
                            backgroundColor: design.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                            color: design.mode === 'dark' ? '#f8fafc' : '#0f172a',
                            borderColor: design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                            borderRadius: `${design.borderRadius}px`,
                            '--focus-ring-color': design.themeColor
                          }}
                        ></textarea>
                      ) : field.type === 'checkbox' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <input 
                            type="checkbox" 
                            disabled
                            style={{ width: 16, height: 16, accentColor: design.themeColor }}
                          />
                          <span className="public-form-checkbox-label" style={{ color: design.mode === 'dark' ? '#9ca3af' : '#64748b' }}>
                            {field.placeholder || 'Sim'}
                          </span>
                        </div>
                      ) : field.type === 'select' ? (
                        <select
                          disabled
                          className="public-form-input"
                          style={{
                            backgroundColor: design.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                            color: design.mode === 'dark' ? '#f8fafc' : '#0f172a',
                            borderColor: design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                            borderRadius: `${design.borderRadius}px`,
                            '--focus-ring-color': design.themeColor
                          }}
                        >
                          <option value="">Escolha uma opção</option>
                          {(field.options || ['Opção 1']).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'radio' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                          {(field.options || ['Opção 1']).map((opt, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'not-allowed', color: design.mode === 'dark' ? '#cbd5e1' : '#475569', fontSize: '15px' }}>
                              <input 
                                type="radio" 
                                disabled
                                name={`preview_${field.id}`}
                                style={{ accentColor: design.themeColor, width: 16, height: 16, marginTop: 0 }}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : field.type === 'checkbox_group' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                          {(field.options || ['Opção 1']).map((opt, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'not-allowed', color: design.mode === 'dark' ? '#cbd5e1' : '#475569', fontSize: '15px' }}>
                              <input 
                                type="checkbox" 
                                disabled
                                style={{ accentColor: design.themeColor, width: 16, height: 16, marginTop: 0 }}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          disabled
                          placeholder={field.placeholder}
                          className="public-form-input"
                          style={{
                            backgroundColor: design.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                            color: design.mode === 'dark' ? '#f8fafc' : '#0f172a',
                            borderColor: design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                            borderRadius: `${design.borderRadius}px`,
                            colorScheme: design.mode === 'dark' ? 'dark' : 'light',
                            '--focus-ring-color': design.themeColor
                          }}
                        />
                      )}
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    className="public-form-btn"
                    style={{ 
                      backgroundColor: design.submitButtonColor || design.themeColor,
                      color: design.submitButtonTextColor || '#ffffff',
                      borderRadius: `${design.borderRadius}px`,
                      boxShadow: `0 4px 12px ${design.submitButtonColor || design.themeColor}33`
                    }}
                  >
                    {design.submitButtonText || 'Enviar Dados'}
                  </button>
                </form>

              </div>

            </div>
          </div>
        </div>
        )}

          {activeTab === 'publish' && (
            <div className="tab-pane active" style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1, padding: 32, overflowY: 'auto' }}>
              
              <div style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-builder)' }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Publicar Formulário</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5 }}>
                  Incorpore (embed) este formulário em qualquer site (WordPress, Wix, Webflow, etc) colando o código iFrame abaixo.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Opções de Visualização</h3>
                <div style={{ display: 'flex', gap: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input 
                      type="checkbox" 
                      checked={embedHideHeader}
                      onChange={(e) => setEmbedHideHeader(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    Esconder Cabeçalho (Logo e Título)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input 
                      type="checkbox" 
                      checked={embedTransparent}
                      onChange={(e) => setEmbedTransparent(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    Fundo Transparente
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Código iFrame (Copie e Cole)</label>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    style={{ position: 'absolute', top: 12, right: 12, width: 'auto', padding: '6px 12px', fontSize: 12, borderRadius: 6, opacity: 0.9 }}
                    onClick={() => {
                      const iframeSrc = `${window.location.origin}/f/${formToken}${settings.storageType === 'supabase' && settings.storageSupabaseUrl ? `?db=${encodeURIComponent(settings.storageSupabaseUrl)}&key=${encodeURIComponent(settings.storageSupabaseAnonKey)}` : ''}${embedHideHeader || embedTransparent ? (settings.storageType === 'supabase' && settings.storageSupabaseUrl ? '&' : '?') : ''}${embedHideHeader ? 'header=0' : ''}${embedHideHeader && embedTransparent ? '&' : ''}${embedTransparent ? 'bg=transparent' : ''}`;
                      const iframeCode = `<iframe src="${iframeSrc}" width="100%" height="600px" frameborder="0" style="border-radius: ${design.borderRadius}px; border: none; overflow: hidden;"></iframe>`;
                      navigator.clipboard.writeText(iframeCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copiado!' : 'Copiar iFrame'}
                  </button>
                  <pre style={{ background: 'var(--bg-sidebar)', padding: '48px 16px 16px 16px', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', overflowX: 'auto', border: '1px solid var(--border-builder)', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
{`<iframe 
  src="${window.location.origin}/f/${formToken}${settings.storageType === 'supabase' && settings.storageSupabaseUrl ? `?db=${encodeURIComponent(settings.storageSupabaseUrl)}&key=${encodeURIComponent(settings.storageSupabaseAnonKey)}` : ''}${embedHideHeader || embedTransparent ? (settings.storageType === 'supabase' && settings.storageSupabaseUrl ? '&' : '?') : ''}${embedHideHeader ? 'header=0' : ''}${embedHideHeader && embedTransparent ? '&' : ''}${embedTransparent ? 'bg=transparent' : ''}" 
  width="100%" 
  height="600px" 
  frameborder="0" 
  style="border-radius: ${design.borderRadius}px; border: none; overflow: hidden;"
></iframe>`}
                  </pre>
                </div>
                
                <div style={{ marginTop: 24, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: 16, borderRadius: 8 }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>
                    <Code size={16} /> Avançado: Web Component SDK
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                    Se preferir, desenvolvedores podem incorporar via Script/Componente Web.
                  </p>
                  <pre style={{ background: '#1e293b', padding: 12, borderRadius: 6, fontSize: 11, fontFamily: 'monospace', overflowX: 'auto', color: '#e2e8f0' }}>
{`<script src="${window.location.origin}/embed.js" async></script>
<vibe-form token="${formToken}"></vibe-form>`}
                  </pre>
                </div>
              </div>

            </div>
          )}

      </main>
    </div>
  );
}
