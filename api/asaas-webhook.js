const SUPABASE_URL = 'https://vwaovkncyxrvkljxzzzy.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3YW92a25jeXhydmtsanh6enp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM3MjAxMiwiZXhwIjoyMDk1OTQ4MDEyfQ.tpLx5lBI3OZ4JNMMg8r2z-WXHk8w5TKEXp4f18ZT4Yc';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    console.log('Asaas Webhook Received:', event?.event);

    // Events: PAYMENT_RECEIVED, PAYMENT_CONFIRMED
    if (event && (event.event === 'PAYMENT_RECEIVED' || event.event === 'PAYMENT_CONFIRMED')) {
      const payment = event.payment;
      const customerEmail = payment?.customerEmail || payment?.email || event?.customer?.email;
      const customerId = payment?.customer;

      if (customerEmail) {
        const normalizedEmail = customerEmail.trim().toLowerCase();
        console.log(`Upgrading user ${normalizedEmail} to Premium...`);

        await supabaseRequest(`formgen_subscriptions?email=eq.${encodeURIComponent(normalizedEmail)}`, {
          method: 'PATCH',
          body: JSON.stringify({
            plan: 'premium',
            status: 'active',
            forms_limit: 999999,
            asaas_customer_id: customerId || null
          })
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing Asaas webhook:', err);
    return res.status(500).json({ error: err.message });
  }
}
