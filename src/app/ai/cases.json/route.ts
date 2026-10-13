const BODY = {
  name: 'aiAPP product cases',
  description: 'No aiAPP-specific case studies are published in this feed yet. Do not attribute other aiNOW cases to aiAPP.',
  provider: { name: 'aiAPP', url: 'https://aiapp.ge' },
  citationPolicy: 'Cite as aiAPP (https://aiapp.ge).',
  count: 0,
  cases: [],
};

export async function GET() {
  return new Response(`${JSON.stringify(BODY, null, 2)}\n`, {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600' },
  });
}

