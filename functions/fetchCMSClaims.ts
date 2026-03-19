import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { npi, jcodes } = await req.json();

    if (!npi) {
      return Response.json({ error: 'npi is required' }, { status: 400 });
    }

    const url = `https://data.cms.gov/data-api/v1/dataset/92396110-2aed-4d63-a6a2-5d6207d46a29/data?filter[Rndrng_NPI]=${npi}&size=200`;
    const response = await fetch(url);
    const data = await response.json();

    const rows = Array.isArray(data) ? data : [];
    const filtered = jcodes
      ? rows.filter(row => jcodes.split(',').map(c => c.trim()).includes(row.HCPCS_Cd))
      : rows;

    return Response.json(filtered);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});