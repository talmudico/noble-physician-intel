import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jcode, state = 'FL' } = await req.json();

    if (!jcode) {
      return Response.json({ error: 'jcode is required' }, { status: 400 });
    }

    const url = `https://data.cms.gov/data-api/v1/dataset/92396110-2aed-4d63-a6a2-5d6207d46a29/data?filter[HCPCS_Cd]=${jcode}&filter[Rndrng_Prvdr_State_Abrvtn]=${state}&size=200`;
    const response = await fetch(url);
    const data = await response.json();

    return Response.json(Array.isArray(data) ? data : []);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});