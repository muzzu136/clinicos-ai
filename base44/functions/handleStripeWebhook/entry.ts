import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const stripeSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !stripeSecret) {
      return Response.json({ error: 'Missing webhook configuration' }, { status: 500 });
    }

    // Verify Stripe signature using async crypto
    const encoder = new TextEncoder();
    const [timestamp, sig] = signature.split(',')[0].replace('t=', '') && signature.split('v1=');
    const signedContent = `${timestamp}.${body}`;
    const key = await crypto.subtle.importKey('raw', encoder.encode(stripeSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const computed = await crypto.subtle.sign('HMAC', key, encoder.encode(signedContent));
    const computedSig = Array.from(new Uint8Array(computed)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (computedSig !== sig?.trim()) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    switch (event.type) {
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const clinics = await base44.asServiceRole.entities.Clinic.filter({ stripe_subscription_id: subscription.id });
        if (clinics.length > 0) {
          await base44.asServiceRole.entities.Clinic.update(clinics[0].id, {
            subscription_status: subscription.status === 'active' ? 'active' : 'past_due',
            plan: subscription.metadata?.plan || clinics[0].plan
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const clinics = await base44.asServiceRole.entities.Clinic.filter({ stripe_subscription_id: subscription.id });
        if (clinics.length > 0) {
          await base44.asServiceRole.entities.Clinic.update(clinics[0].id, { subscription_status: 'cancelled' });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});