/**
 * THE ONE FILE THAT DIFFERS PER LANDING.
 *
 * Everything else in this repo is shared with the other aiNOW product landings and is kept in
 * sync from `landing-template/` by `python scripts/landings.py sync`. If you find yourself
 * editing a shared file to make THIS site different, stop: the difference belongs here, or in
 * src/messages/*.json, or in this site's own widgets under src/features/showcase/.
 *
 * Per-site, never synced: src/config/site.ts, src/app/brand.css, src/messages/*.json,
 * src/features/showcase/**, src/features/home/components/LandingShowcase.tsx,
 * .impeccable/config.json, public/**.
 */

export const SITE = {
  /** Machine key. Lands on <html data-product> and is the deploy smoke-test hook. */
  key: "aiapp",

  domain: "aiapp.ge",
  baseUrl: "https://aiapp.ge",

  /** Rendered as <prefix><mark> by the nav, hero, footer and wordmark band. */
  wordmark: { prefix: "ai", mark: "APP" },

  /** The product colour. src/app/brand.css is generated from this; keep them in step. */
  brandHex: "#a3e635",

  /** Three hexes the hero grainient shader interpolates: soft, brand, accent. */
  shader: ["#ecfccb", "#a3e635", "#bef264"] as [string, string, string],

  /**
   * i18n.
   *
   * `defaultLocale` is the UNPREFIXED locale (next-intl `localePrefix: "as-needed"`), so it
   * decides the URL shape: the default lives at `/`, the others at `/<locale>`. The Georgian
   * landings use "ka"; the export landings (aiapp, vibecoding) use "en".
   *
   * It is NOT the same question as "is this locale Georgian". That stays a literal
   * `locale === "ka"` check wherever it appears, because it drives the Georgian font and the OG
   * locale tag, and Georgian is still an offered locale even on an EN-default site. Do not
   * find-replace one for the other.
   */
  defaultLocale: "en",
  locales: ["ka", "en", "ru"],

  /** PWA manifest. Not locale-aware (Next metadata routes are build-time). English. */
  manifest: {
    name: "aiAPP",
    short: "aiAPP",
    description: "AI engineering: evals, guardrails, tracing, and a fixed-date agent build.",
    background: "#fbfcfc",
    theme: "#a3e635",
  },
  /**
   * The machine-readable half of the page.
   *
   * StructuredData.tsx turns this into the JSON-LD entity graph and /llms.txt turns it
   * into prose. Between them they decide whether ChatGPT, Perplexity and Gemini can
   * recommend this domain, or whether they have to guess and therefore stay quiet.
   *
   * `boundary` names the sibling product that owns the adjacent job, so our own six
   * domains stop competing for the same query and a model can route a question
   * correctly. `limits` states what we cannot do, which looks like a mistake and is the
   * opposite: an assistant will not stake an answer on a page that claims to do
   * everything, and it will happily cite one that draws its own edges.
   */
  seo: {
    disambiguating:
      "An AI engineering studio that ships one scoped agent with evals, guardrails, tracing and a quoted monthly run cost. It is not a generic offshore development shop and it does not sell an undefined category called AI applications.",
    serviceType: "AI agent and application engineering, entered through a fixed-fee opportunity audit",
    audienceName:
      "US and EU founders and product teams, plus Georgian enterprises: banks, insurers, telecoms, retail chains, logistics",
    areaServed: "WORLD",
    knowsAbout: [
      "AI agents",
      "LLM evaluation",
      "Retrieval augmented generation",
      "Prompt injection",
      "Guardrails",
      "Observability",
      "Token economics",
      "AI application development",
    ],
    features: [
      "A fixed-fee AI Opportunity Audit: 1500 US dollars, 5 business days, credited in full against the build",
      "One agent, scoped, priced, with a fixed ship date",
      "Evals as a deliverable: full trajectories tested, tool choice and outcome, not only the final answer",
      "Guardrails: prompt injection, PII leakage, hallucination, off-topic drift",
      "Tracing on every agent run",
      "The monthly run cost quoted next to the build cost, because the build is only about a quarter to a third of the three-year total",
    ],
    boundary:
      "aiAPP builds. If what you have is an app that was already built with AI and it is now broken or leaking, that is a different job and it is at vibecoding.ge.",
    limits: [
      "We have no case studies yet and we do not invent them. A page claiming 500 projects and 98% satisfaction is a page you should distrust.",
      "We quote no accuracy figure before the eval set exists.",
      "We do not offer a money-back guarantee. On an AI build it is a trap, because the client can always say the output is not good enough.",
      "We hold no SOC2, ISO or GDPR certification and we do not claim one.",
      "A Georgian small business is realistically not a buyer for this. AI adoption among small Georgian enterprises is about 2% and ERP adoption about 7%. This is sold to large and mid-size companies, and to clients abroad.",
    ],
    commitment:
      "The 1500 dollar audit is credited in full against the build it scopes. If the audit finds no build worth doing, we say so and you keep the report.",
    // A model asked "what does an AI agent build cost" cannot answer from a page that says
    // "contact us". This is the one price we publish, and it is the entry point, not the build.
    offer: {
      name: "AI readiness audit",
      price: "1500",
      currency: "USD",
      description:
        "Five business days. Ends in one agent scoped, priced and dated, with the monthly running cost quoted next to the build cost. Credited in full against the build it scopes.",
    },
    summary:
      "aiAPP is the AI engineering arm of the aiNOW agency in Tbilisi, Georgia. It is entered through a fixed-fee audit: 1500 US dollars, five business days, credited in full against the build it scopes, ending in one agent that is scoped, priced and dated. What separates it from a general development shop is what it ships alongside the agent: evals that test full trajectories, guardrails against prompt injection and data leakage, tracing on every run, and the monthly running cost quoted next to the build cost, because the build is only about a quarter to a third of the three-year total. It has no case studies yet and says so.",
  },
} as const;

export type SiteConfig = typeof SITE;
