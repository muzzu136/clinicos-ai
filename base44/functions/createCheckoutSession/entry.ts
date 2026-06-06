import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeKey || !plan) {
      return Response.json({ error: 'Missing configuration' }, { status: 500 });
    }

    // Get or create clinic for user
    let clinic = null;
    const clinics = await base44.entities.Clinic.filter({ admin_id: user.id });
    if (clinics.length === 0) {
      clinic = await base44.entities.Clinic.create({
        name: user.full_name + "'s Clinic",
        admin_id: user.id,
        subscription_status: 'trial'
      });
    } else {
      clinic = clinics[0];
    }

    // Stripe price IDs (configure in Stripe dashboard)
    const priceMap = {
      starter: 'price_starter_monthly',
      pro: 'price_pro_monthly',
      enterprise: 'price_enterprise_monthly'
    };

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'success_url': `${req.headers.get('origin')}/subscription/success`,
        'cancel_url': `${req.headers.get('origin')}/subscription`,
        'payment_method_types[]': 'card',
        'mode': 'subscription',
        'line_items[0][price]': priceMap[plan] || priceMap.starter,
        'line_items[0][quantity]': '1',
        'client_reference_id': clinic.id,
        'customer_email': user.email
      })
    });

    const session = await response.json();

    if (!response.ok) {
      return Response.json({ error: session.error?.message }, { status: 400 });
    }

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});