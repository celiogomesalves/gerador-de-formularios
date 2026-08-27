const fs = require('fs');
let code = fs.readFileSync('src/pages/Builder.jsx', 'utf8');

// 1. Add session prop and imports
code = code.replace(
  "export default function Builder() {",
  "import { getFormFromDrive, saveFormToDrive } from '../lib/googleDrive';\nexport default function Builder({ session }) {"
);

// 2. Change state initializations
code = code.replace(
  `  const [fields, setFields] = useState(() => {`,
  `  const [isLoadingDrive, setIsLoadingDrive] = useState(true);
  const [driveFolderId, setDriveFolderId] = useState(localStorage.getItem('google_folder_id') || null);
  const googleToken = session?.access_token;
  
  const [fields, setFields] = useState(() => {`
);

// 3. Remove synchronous localStorage from useState initializers
// Actually, it's easier to just keep them as is (they will return defaults or empty), 
// and then use a useEffect to override them with Drive data.
// Let's find the end of defaultSettingsState
code = code.replace(
  `    };
  }

  const [copied, setCopied] = useState(false);`,
  `    };
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

  const [copied, setCopied] = useState(false);`
);

// 4. Update saveConfigToLocal
const oldSaveFn = `  const saveConfigToLocal = async () => {
    const configData = { fields, design, settings };
    localStorage.setItem(\`form_\${formToken}\`, JSON.stringify(configData));

    // Real Supabase Cloud Save
    if (settings.storageType === 'supabase' && settings.storageSupabaseUrl && settings.storageSupabaseAnonKey) {
      try {
        const queryUrl = \`\${settings.storageSupabaseUrl}/rest/v1/forms?token=eq.\${formToken}&select=id\`;
        const queryRes = await fetch(queryUrl, {
          headers: {
            'apikey': settings.storageSupabaseAnonKey,
            'Authorization': \`Bearer \${settings.storageSupabaseAnonKey}\`
          }
        });
        
        const bodyStr = JSON.stringify({
          token: formToken,
          fields: fields,
          design: design,
          settings: settings
        });

        if (queryRes.ok) {
          const data = await queryRes.json();
          if (data && data.length > 0) {
            // EXISTS: PATCH
            await fetch(\`\${settings.storageSupabaseUrl}/rest/v1/forms?token=eq.\${formToken}\`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': settings.storageSupabaseAnonKey,
                'Authorization': \`Bearer \${settings.storageSupabaseAnonKey}\`,
                'Prefer': 'return=minimal'
              },
              body: bodyStr
            });
          } else {
            // NOT EXISTS: POST
            await fetch(\`\${settings.storageSupabaseUrl}/rest/v1/forms\`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': settings.storageSupabaseAnonKey,
                'Authorization': \`Bearer \${settings.storageSupabaseAnonKey}\`,
                'Prefer': 'return=minimal'
              },
              body: bodyStr
            });
          }
        }
      } catch (e) {
        console.error('Erro ao sincronizar com Supabase Cloud', e);
      }
    }
  };`;

const newSaveFn = `  const saveConfigToLocal = async () => {
    const configData = { fields, design, settings };
    localStorage.setItem(\`form_\${formToken}\`, JSON.stringify(configData));
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
           navigate(\`/builder/\${fileId}\`, { replace: true });
        }
      } catch (err) {
        console.error("Auto-save to drive failed", err);
      }
    }, 2000); // 2 second debounce
    
    return () => clearTimeout(timer);
  }, [fields, design, settings, isLoadingDrive, googleToken]);
`;

code = code.replace(oldSaveFn, newSaveFn);

fs.writeFileSync('src/pages/Builder.jsx', code);
console.log('Builder patched');
