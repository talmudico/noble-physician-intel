import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query) {
      return Response.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&${query}`;
    const response = await fetch(url);
    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});