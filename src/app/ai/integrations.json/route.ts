import {
  OWN_PRODUCT_DOMAIN,
  PUBLIC_PRODUCT_CATALOG,
  PUBLIC_FACTS,
  TIKTOK_PRODUCT_ROADMAP,
} from "@/lib/public-facts";

export const revalidate = 86400;

export function GET(): Response {
  return Response.json(
    {
      name: PUBLIC_PRODUCT_CATALOG[0]?.name ?? PUBLIC_FACTS.brand.name,
      url: OWN_PRODUCT_DOMAIN,
      platform: "TikTok",
      status: "planned",
      availableNow: false,
      launchDate: null,
      limitation:
        "No live TikTok API connection is currently available. Launch depends on TikTok approval, approved scopes, account eligibility and regional availability.",
      products: TIKTOK_PRODUCT_ROADMAP.filter((item) => item.domain === OWN_PRODUCT_DOMAIN),
      lastUpdated: PUBLIC_FACTS.lastUpdated,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    },
  );
}
