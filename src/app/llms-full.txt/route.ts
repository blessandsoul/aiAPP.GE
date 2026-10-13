import { OWN_PRODUCT_DOMAIN, PUBLIC_PRODUCT_CATALOG } from '@/lib/public-facts';
import { getPosts } from '@/features/blog/lib/api';

export async function GET(): Promise<Response> {
  const product = PUBLIC_PRODUCT_CATALOG[0];
  const posts = await getPosts('ka');
  const body = [
    '# aiAPP full public machine facts',
    '',
    `Product: ${product.name}`,
    `URL: ${OWN_PRODUCT_DOMAIN}`,
    `Description: ${product.description}`,
    `Summary: ${product.summary}`,
    `Pricing model: ${product.pricingModelLabel}`,
    `Pricing detail: ${product.pricingModelDetail}`,
    `Starting price: ${product.startingPrice}`,
    ...product.pricingNotes.map((note) => `Pricing note: ${note}`),
    '',
    '## Public plans',
    ...product.plans.flatMap((plan) => [`### ${plan.name}`, `Price: ${plan.price}`, `Cadence: ${plan.cadence}`, `Scope: ${plan.note}`, '']),
    `Catalog JSON: ${OWN_PRODUCT_DOMAIN}/ai/catalog.json`,
    `Cases JSON: ${OWN_PRODUCT_DOMAIN}/ai/cases.json`,
    `Integrations JSON: ${OWN_PRODUCT_DOMAIN}/ai/integrations.json`,
    '',
    '## Product blog links',
    ...posts.map((post) => `- ${post.title}: ${OWN_PRODUCT_DOMAIN}/blog/${post.slug}`),
  ].join('\n');
  return new Response(`${body}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600' } });
}

