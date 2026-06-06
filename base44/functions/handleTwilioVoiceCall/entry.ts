import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const formData = await req.formData();
    const fromNumber = formData.get('From');
    const callSid = formData.get('CallSid');

    // Parse clinic_id from Twilio incoming number (set in Twilio dashboard)
    const clinicId = req.headers.get('x-clinic-id');

    if (!clinicId) {
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Error: Clinic not found</Say>
  <Hangup/>
</Response>`, { 
        status: 200, 
        headers: { 'Content-Type': 'application/xml' } 
      });
    }

    // Log the call
    await base44.asServiceRole.entities.Call?.create?.({
      clinic_id: clinicId,
      from_number: fromNumber,
      call_sid: callSid,
      status: 'incoming',
      timestamp: new Date().toISOString()
    }).catch(() => null);

    // Return IVR response
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Welcome to our clinic. Please wait while we connect you to an available representative.</Say>
  <Enqueue waitUrl="https://your-domain.com/hold-music">clinic-queue</Enqueue>
</Response>`, { 
      status: 200, 
      headers: { 'Content-Type': 'application/xml' } 
    });
  } catch (error) {
    console.error(error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We are experiencing technical difficulties. Please call back later.</Say>
  <Hangup/>
</Response>`, { 
      status: 500, 
      headers: { 'Content-Type': 'application/xml' } 
    });
  }
});