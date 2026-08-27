const fs = require('fs');
let code = fs.readFileSync('src/pages/PublicForm.jsx', 'utf8');

const oldLoadConfig = `  useEffect(() => {
    const loadConfig = async () => {
      // If we have DB credentials in URL, try to load from Supabase Cloud
      if (dbUrl && dbKey) {
        try {
          const url = \`\${dbUrl}/rest/v1/forms?token=eq.\${token}&select=*\`;
          const response = await fetch(url, {
            headers: {
              'apikey': dbKey,
              'Authorization': \`Bearer \${dbKey}\`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const parsedData = data[0];
              setConfig({
                fields: parsedData.fields || [],
                design: { ...config.design, ...parsedData.design },
                settings: { ...config.settings, ...parsedData.settings }
              });
              setLoading(false);
              return; // Successfully loaded from cloud
            }
          }
        } catch (e) {
          console.error("Erro ao carregar do Supabase Cloud:", e);
        }
      }

      // Fallback to LocalStorage
      const storedForm = localStorage.getItem(\`form_\${token}\`);
      
      if (storedForm) {
        try {
          const parsedData = JSON.parse(storedForm);
          setConfig({
            fields: parsedData.fields || [],
            design: { ...config.design, ...parsedData.design },
            settings: { ...config.settings, ...parsedData.settings }
          });
        } catch (e) {
          console.error("Erro ao ler configuração do formulário:", e);
        }
      } else {
        // Mock fallback
        setConfig(prev => ({
          ...prev,
          fields: [
            { id: '1', key: 'email', type: 'email', required: true, label: 'E-mail', placeholder: 'Seu melhor e-mail' },
            { id: '2', key: 'nome', type: 'text', required: true, label: 'Nome Completo', placeholder: 'Seu nome e sobrenome' }
          ]
        }));
      }
      
      setLoading(false);
    };

    loadConfig();
  }, [token]);`;

const newLoadConfig = `  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Assume token is the Google Drive File ID
        // Note: uc endpoint might sometimes redirect to a HTML page if file is large, but JSON is small.
        const url = \`https://drive.google.com/uc?export=download&id=\${token}\`;
        const response = await fetch(url);
        
        if (response.ok) {
          const parsedData = await response.json();
          setConfig({
            fields: parsedData.fields || [],
            design: { ...config.design, ...parsedData.design },
            settings: { ...config.settings, ...parsedData.settings }
          });
        } else {
          // If not found in drive, fallback to localStorage (for old local tests)
          const storedForm = localStorage.getItem(\`form_\${token}\`);
          if (storedForm) {
            const parsedData = JSON.parse(storedForm);
            setConfig({
              fields: parsedData.fields || [],
              design: { ...config.design, ...parsedData.design },
              settings: { ...config.settings, ...parsedData.settings }
            });
          } else {
             throw new Error('Not found locally or in Drive');
          }
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
  }, [token]);`;

code = code.replace(oldLoadConfig, newLoadConfig);

fs.writeFileSync('src/pages/PublicForm.jsx', code);
console.log('PublicForm patched');
