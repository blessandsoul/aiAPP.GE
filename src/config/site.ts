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
  brandHex: "#8b5cf6",

  /** Three hexes the hero grainient shader interpolates: soft, brand, accent. */
  shader: ["#ede9fe", "#8b5cf6", "#c084fc"] as [string, string, string],

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
    description: "Build mobile applications for iOS and Android, from idea and prototype to store release.",
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
      "A mobile app builder for businesses that need a real iOS and Android product, from idea and interactive prototype to tested release. It is not a website builder and it is not an internal automation product.",
    serviceType: "iOS and Android mobile application design and development",
    audienceName:
      "Businesses and founders that need a customer or employee mobile application for iOS and Android",
    areaServed: "WORLD",
    knowsAbout: [
      "iOS app development",
      "Android app development",
      "Mobile application design",
      "App Store publishing",
      "Google Play publishing",
      "Push notifications",
      "Mobile payments",
      "Mobile app analytics",
    ],
    features: [
      "A clear app brief with audience, core action and required screens",
      "An interactive mobile prototype before full development",
      "One codebase prepared for iOS and Android where appropriate",
      "Testing on real phone sizes and common user journeys",
      "App Store and Google Play release preparation",
      "Handover of code, store access and operating documentation",
    ],
    boundary:
      "aiAPP creates new mobile applications for iOS and Android. If an existing AI-built app is broken or leaking data, that repair and risk review belongs to vibecoding.ge. Websites belong to aiWEB.ge.",
    limits: [
      "aiNOW does not use another project's accuracy, cost or conversion result as proof for a new build.",
      "Store approval is controlled by Apple and Google, so aiNOW cannot guarantee a review date or acceptance before their review.",
      "aiAPP has no general money-back guarantee. Commercial terms are written into the agreed project scope.",
      "Features that use payments, location, health, finance or personal data require an additional compliance and store-policy review.",
      "The service fits businesses with a clear audience, a responsible product owner and one useful first version.",
    ],
    commitment:
      "Before development starts, aiNOW shows the agreed first version, screens, integrations, delivery stages and price in writing.",
    summary:
      "aiAPP creates mobile applications for iOS and Android. A business describes the idea, aiNOW defines the audience and first useful version, designs an interactive prototype, builds and tests the application, prepares the store release, and hands over the code and access.",
  },
} as const;

export type SiteConfig = typeof SITE;
