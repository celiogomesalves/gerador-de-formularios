const SUPABASE_URL = 'https://vwaovkncyxrvkljxzzzy.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3YW92a25jeXhydmtsanh6enp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM3MjAxMiwiZXhwIjoyMDk1OTQ4MDEyfQ.tpLx5lBI3OZ4JNMMg8r2z-WXHk8w5TKEXp4f18ZT4Yc';

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, asaas-access-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check via GET
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'FormGen Asaas Webhook Listener' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    console.log('Asaas Webhook Event:', event?.event);

    const payment = event?.payment;
    // Asaas can send customer email in payment.customerEmail or customer object
    const customerEmail = payment?.customerEmail || payment?.email || event?.customer?.email || event?.customerEmail;
    const customerName = payment?.customerName || event?.customer?.name || 'Cliente Asaas';
    const customerId = payment?.customer || event?.customer?.id;

    if (!customerEmail) {
      console.warn('Webhook received without customer email. Event:', event?.event);
      return res.status(200).json({ received: true, note: 'No customer email found in payload' });
    }

    const normalizedEmail = customerEmail.trim().toLowerCase();

    // 1. PAYMENT CONFIRMED / RECEIVED (Upgrade to Premium)
    if (event.event === 'PAYMENT_RECEIVED' || event.event === 'PAYMENT_CONFIRMED') {
      console.log(`Upgrading ${normalizedEmail} to Premium...`);

      // Check if user already exists in Supabase
      const existing = await supabaseRequest(`formgen_subscriptions?email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`);

      if (existing && existing.length > 0) {
        // Update to Premium
        await supabaseRequest(`formgen_subscriptions?email=eq.${encodeURIComponent(normalizedEmail)}`, {
          method: 'PATCH',
          body: JSON.stringify({
            plan: 'premium',
            status: 'active',
            forms_limit: 999999,
            asaas_customer_id: customerId || existing[0].asaas_customer_id || null
          })
        });
      } else {
        // Create as Premium directly (in case user paid before logging in)
        await supabaseRequest('formgen_subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            email: normalizedEmail,
            name: customerName,
            serial_key: generateSerialKey(),
            plan: 'premium',
            status: 'active',
            forms_limit: 999999,
            asaas_customer_id: customerId || null
          })
        });
      }
    }

    // 2. PAYMENT REFUNDED / REVERSED (Downgrade to Free)
    if (event.event === 'PAYMENT_REFUNDED' || event.event === 'PAYMENT_REVERSED') {
      console.log(`Downgrading ${normalizedEmail} to Free due to refund...`);
      await supabaseRequest(`formgen_subscriptions?email=eq.${encodeURIComponent(normalizedEmail)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          plan: 'free',
          forms_limit: 1
        })
      });
    }

    // 3. PAYMENT OVERDUE (Optional notification / suspend)
    if (event.event === 'PAYMENT_OVERDUE') {
      console.log(`Payment overdue for ${normalizedEmail}`);
    }

    return res.status(200).json({ received: true, event: event.event, user: normalizedEmail });
  } catch (err) {
    console.error('Error processing Asaas webhook:', err);
    return res.status(500).json({ error: err.message });
  }
}
