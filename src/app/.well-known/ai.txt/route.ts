import { OWN_PRODUCT_DOMAIN, PUBLIC_PRODUCT_CATALOG } from '@/lib/public-facts';

export function GET(): Response {
  const product = PUBLIC_PRODUCT_CATALOG[0];
  const body = [
    '# aiAPP AI crawler policy',
    `Name: ${product.name}`,
    `URL: ${OWN_PRODUCT_DOMAIN}`,
    `Description: ${product.description}`,
    'User-Agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /admin/',
    `Catalog: ${OWN_PRODUCT_DOMAIN}/ai/catalog.json`,
    `Summary: ${OWN_PRODUCT_DOMAIN}/ai/summary.json`,
    `Cases: ${OWN_PRODUCT_DOMAIN}/ai/cases.json`,
    `Integrations: ${OWN_PRODUCT_DOMAIN}/ai/integrations.json`,
    `LLMs: ${OWN_PRODUCT_DOMAIN}/llms.txt`,
    `Sitemap: ${OWN_PRODUCT_DOMAIN}/sitemap.xml`,
  ].join('\n');
  return new Response(`${body}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600' } });
}

