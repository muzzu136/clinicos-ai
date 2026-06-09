import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const API_URL = Deno.env.get("AWS_API_GATEWAY_URL");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, id, data, clinic_id } = await req.json();

    if (!clinic_id) {
      return Response.json({ error: 'clinic_id is required' }, { status: 400 });
    }

    const BASE = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    let url = `${BASE}/appointments`;
    let method = 'GET';
    let body = undefined;

    if (action === 'list') {
      method = 'GET';
      url += `?clinic_id=${encodeURIComponent(clinic_id)}`;
    } else if (action === 'get') {
      url = `${BASE}/appointments/${id}`;
      method = 'GET';
    } else if (action === 'create') {
      method = 'POST';
      body = JSON.stringify(data);
    } else if (action === 'update') {
      url = `${BASE}/appointments/${id}`;
      method = 'PUT';
      body = JSON.stringify(data);
    } else if (action === 'delete') {
      url = `${BASE}/appointments/${id}`;
      method = 'DELETE';
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const result = await response.json();
    return Response.json(result, { status: response.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});