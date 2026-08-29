const SUPABASE_URL = 'https://vwaovkncyxrvkljxzzzy.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3YW92a25jeXhydmtsanh6enp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM3MjAxMiwiZXhwIjoyMDk1OTQ4MDEyfQ.tpLx5lBI3OZ4JNMMg8r2z-WXHk8w5TKEXp4f18ZT4Yc';
const OWNER_EMAIL = 'celiogomesalves@gmail.com';

function generateSerialKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `FGEN-${segment(4)}-${segment(4)}-${segment(4)}`;
}

async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_ROLE,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  if (response.status === 204) return null;
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // 1. Get or Create user subscription
    if (action === 'get_or_create') {
      const email = req.query.email || req.body?.email;
      const name = req.query.name || req.body?.name || 'Usuário';

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();

      // Check if user exists
      const users = await supabaseRequest(`formgen_subscriptions?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`);
      
      let user = users && users.length > 0 ? users[0] : null;

      if (!user) {
        // Create new record
        const newRecord = {
          email: normalizedEmail,
          name: name,
          serial_key: isOwner ? 'FGEN-OWNER-CELIO-PRO' : generateSerialKey(),
          plan: isOwner ? 'premium' : 'free',
          status: 'active',
          forms_limit: isOwner ? 999999 : 1
        };

        const created = await supabaseRequest('formgen_subscriptions', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(newRecord)
        });

        user = Array.isArray(created) ? created[0] : newRecord;
      }

      // Fetch config for Asaas payment link
      const configRes = await supabaseRequest(`formgen_subscriptions?email=eq.__formgen_config__&limit=1`);
      const asaasPaymentUrl = configRes && configRes.length > 0 ? configRes[0].asaas_customer_id : '';

      return res.status(200).json({
        ...user,
        isOwner,
        asaasPaymentUrl
      });
    }

    // 2. Get Public Config (Asaas URL)
    if (action === 'get_config') {
      const configRes = await supabaseRequest(`formgen_subscriptions?email=eq.__formgen_config__&limit=1`);
      const asaasPaymentUrl = configRes && configRes.length > 0 ? configRes[0].asaas_customer_id : '';
      return res.status(200).json({ asaasPaymentUrl });
    }

    // 3. Save Config (Admin Only)
    if (action === 'save_config') {
      const adminEmail = req.body?.adminEmail?.trim().toLowerCase();
      if (adminEmail !== OWNER_EMAIL.toLowerCase()) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const { asaasPaymentUrl } = req.body;
      const existing = await supabaseRequest(`formgen_subscriptions?email=eq.__formgen_config__&limit=1`);

      if (existing && existing.length > 0) {
        await supabaseRequest(`formgen_subscriptions?email=eq.__formgen_config__`, {
          method: 'PATCH',
          body: JSON.stringify({ asaas_customer_id: asaasPaymentUrl })
        });
      } else {
        await supabaseRequest('formgen_subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            email: '__formgen_config__',
            name: 'System Config',
            serial_key: 'SYS-CONFIG-KEY',
            plan: 'system',
            status: 'active',
            forms_limit: 0,
            asaas_customer_id: asaasPaymentUrl
          })
        });
      }

      return res.status(200).json({ success: true, asaasPaymentUrl });
    }

    // 4. List all users (Admin Only)
    if (action === 'list_users') {
      const adminEmail = (req.query.adminEmail || req.body?.adminEmail || '').trim().toLowerCase();
      if (adminEmail !== OWNER_EMAIL.toLowerCase()) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const allRecords = await supabaseRequest(`formgen_subscriptions?order=created_at.desc`);
      const users = (allRecords || []).filter(u => u.email !== '__formgen_config__');
      
      const configRes = await supabaseRequest(`formgen_subscriptions?email=eq.__formgen_config__&limit=1`);
      const asaasPaymentUrl = configRes && configRes.length > 0 ? configRes[0].asaas_customer_id : '';

      return res.status(200).json({
        users,
        asaasPaymentUrl,
        totalUsers: users.length,
        premiumUsers: users.filter(u => u.plan === 'premium').length,
        freeUsers: users.filter(u => u.plan === 'free').length
      });
    }

    // 5. Update user plan / status (Admin Only)
    if (action === 'update_plan') {
      const adminEmail = req.body?.adminEmail?.trim().toLowerCase();
      if (adminEmail !== OWNER_EMAIL.toLowerCase()) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const { userEmail, plan, status } = req.body;
      if (!userEmail) {
        return res.status(400).json({ error: 'userEmail é obrigatório' });
      }

      const patchData = {};
      if (plan) {
        patchData.plan = plan;
        patchData.forms_limit = plan === 'premium' ? 999999 : 1;
      }
      if (status) {
        patchData.status = status;
      }

      await supabaseRequest(`formgen_subscriptions?email=eq.${encodeURIComponent(userEmail.trim().toLowerCase())}`, {
        method: 'PATCH',
        body: JSON.stringify(patchData)
      });

      return res.status(200).json({ success: true, updated: patchData });
    }

    return res.status(400).json({ error: 'Ação inválida' });
  } catch (err) {
    console.error('Subscription API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
