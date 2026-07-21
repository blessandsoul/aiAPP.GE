import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const COMPONENTS = [
  'AppEval.tsx',
  'AppTraceReplay.tsx',
  'AppCost.tsx',
  'AppLadder.tsx',
  'AppSafeHandoff.tsx',
  'HeroProof.tsx',
];

const sources = Object.fromEntries(
  COMPONENTS.map((component) => [
    component,
    readFileSync(new URL(component, import.meta.url), 'utf8'),
  ]),
);

const landingShowcaseSource = readFileSync(
  new URL('../home/components/LandingShowcase.tsx', import.meta.url),
  'utf8',
);
const productCapabilitiesSource = readFileSync(
  new URL('../home/components/ProductCapabilities.tsx', import.meta.url),
  'utf8',
);
const landingHeroSource = readFileSync(
  new URL('../home/components/LandingHero.tsx', import.meta.url),
  'utf8',
);
const landingHeroCss = readFileSync(
  new URL('../home/components/landing-hero.css', import.meta.url),
  'utf8',
);
const heroWorkflowSource = readFileSync(
  new URL('../home/components/HeroWorkflowStory.tsx', import.meta.url),
  'utf8',
);
const landingNavCss = readFileSync(
  new URL('../home/components/landing-nav.css', import.meta.url),
  'utf8',
);
const landingNavSource = readFileSync(
  new URL('../home/components/LandingNav.tsx', import.meta.url),
  'utf8',
);
const brandCss = readFileSync(new URL('../../app/brand.css', import.meta.url), 'utf8');
const lightControlSources = [
  sources['AppEval.tsx'],
  sources['AppLadder.tsx'],
  sources['AppSafeHandoff.tsx'],
  readFileSync(new URL('../home/components/LandingFaq.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../home/components/LandingCta.tsx', import.meta.url), 'utf8'),
].join('\n');

const locales = Object.fromEntries(
  ['en', 'ka', 'ru'].map((locale) => [
    locale,
    JSON.parse(readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), 'utf8')),
  ]),
);

const PUBLIC_NAMESPACES = [
  'seo',
  'hero',
  'work',
  'faq',
  'cta',
  'wordmark',
  'eval',
  'trace',
  'handoff',
  'cost',
  'ladder',
  'proof',
  'heroStory',
  'capabilities',
];

test('the primary application story is readable business UI, not JSON or terminal output', () => {
  const primary = `${sources['AppEval.tsx']}\n${sources['AppTraceReplay.tsx']}`;

  for (const term of ['trace_id', 'tool_call', 'prompt injection', 'eval suite']) {
    assert.doesNotMatch(primary, new RegExp(term, 'iu'), term);
  }
  assert.doesNotMatch(primary, /JSON\.stringify|<pre|<code/u);
});

test('every aiAPP demo uses the bundled Solar Ico registry without decorative glyphs', () => {
  for (const [component, source] of Object.entries(sources).filter(([name]) => name !== 'HeroProof.tsx')) {
    assert.match(source, /import \{ Ico \} from '@\/components\/common\/Ico';/u, component);
    assert.match(source, /<Ico/u, component);
    assert.doesNotMatch(source, /lucide-react/u, component);
    assert.doesNotMatch(source, /<svg/u, component);
    assert.doesNotMatch(source, />\s*[!+×✓→←]\s*</u, component);
    assert.doesNotMatch(source, /\buppercase\b/u, component);
  }

  assert.match(sources['HeroProof.tsx'], /<HeroWorkflowStory/u);
  assert.match(sources['HeroProof.tsx'], /productIcon="solar:smartphone-bold-duotone"/u);
  assert.match(heroWorkflowSource, /import \{ Ico \} from '@\/components\/common\/Ico';/u);
  assert.match(heroWorkflowSource, /<Ico/u);
  assert.doesNotMatch(`${sources['HeroProof.tsx']}\n${heroWorkflowSource}`, /lucide-react|<svg|>\s*[!+×✓→←]\s*</u);
});

test('Cost and Ladder remain visible visitor controls with Replay', () => {
  for (const component of ['AppCost.tsx', 'AppLadder.tsx']) {
    const source = sources[component];
    assert.match(source, /aria-controls|type="range"/u, component);
    assert.match(source, /t\('replay'\)/u, component);
    assert.match(source, /solar:refresh-bold-duotone/u, component);
  }
});

test('animated business states use reserved slots instead of changing section height', () => {
  assert.match(
    sources['AppLadder.tsx'],
    /data-ladder-detail-slot="true"[\s\S]*min-h-\[440px\][\s\S]*max-\[359px\]:min-h-\[600px\][\s\S]*md:min-h-\[310px\]/u,
  );
  assert.doesNotMatch(
    sources['AppLadder.tsx'],
    /\{active && \(\s*<motion\.span/u,
  );
  assert.match(
    sources['AppEval.tsx'],
    /grid min-h-\[88px\] grid-cols-\[minmax\(0,1fr\)_auto\][^"\n]*md:min-h-\[76px\]/u,
  );
  assert.match(
    sources['AppTraceReplay.tsx'],
    /data-trace-stage="true"[\s\S]*min-h-\[78px\]/u,
  );
});

test('every feature uses the same plain story shell and keeps the business result visible', () => {
  for (const component of ['AppEval.tsx', 'AppTraceReplay.tsx', 'AppCost.tsx', 'AppLadder.tsx', 'AppSafeHandoff.tsx']) {
    const source = sources[component];
    assert.match(source, /<AppDemoStory/u, component);
    assert.match(source, /businessResultLabel/u, component);
    assert.match(source, /businessResult/u, component);
  }
});

test('each feature exposes at most one secondary control plus Replay', () => {
  const expectedButtonCounts = {
    'AppEval.tsx': 1,
    'AppTraceReplay.tsx': 1,
    'AppCost.tsx': 1,
    'AppLadder.tsx': 2,
    'AppSafeHandoff.tsx': 1,
  };

  for (const [component, expected] of Object.entries(expectedButtonCounts)) {
    assert.equal((sources[component].match(/<button\b/gu) ?? []).length, expected, component);
  }
  assert.equal((sources['AppCost.tsx'].match(/type="range"/gu) ?? []).length, 1);
});

test('reduced motion never changes the server and client initial markup', () => {
  assert.doesNotMatch(
    sources['AppLadder.tsx'],
    /initial=\{reduced\s*\?/u,
    'AppLadder initial markup must not depend on a browser-only media query',
  );
});

test('the landing shows one static list of exactly five business capabilities', () => {
  assert.match(landingShowcaseSource, /useTranslations\('product\.capabilities'\)/u);
  assert.match(landingShowcaseSource, /<ProductCapabilities/u);
  assert.match(landingShowcaseSource, /items=\{ICONS\.map/u);
  assert.equal((landingShowcaseSource.match(/solar:[a-z0-9-]+/gu) ?? []).length, 5);
  for (const oldDemo of ['AppEval', 'AppTraceReplay', 'AppCost', 'AppLadder', 'AppSafeHandoff']) {
    assert.doesNotMatch(landingShowcaseSource, new RegExp(`features/showcase/${oldDemo}|<${oldDemo}`), oldDemo);
  }
  assert.doesNotMatch(landingShowcaseSource, /data-landing-demo/u);
  assert.match(productCapabilitiesSource, /items\.map\(\(item, index\)/u);
  assert.match(productCapabilitiesSource, /data-feature-section="true"/u);
  assert.match(productCapabilitiesSource, /data-feature-id=\{`capability-\$\{index \+ 1\}`\}/u);
  assert.doesNotMatch(productCapabilitiesSource, /data-landing-demo/u);
});

test('the hero CTA uses the bundled icon and keeps audience copy in sentence case', () => {
  assert.doesNotMatch(landingHeroSource, /<svg/u);
  assert.match(landingHeroSource, /solar:arrow-right-bold-duotone/u);
  assert.doesNotMatch(landingHeroSource, /hero-audience[^"\n]*\buppercase\b/u);
});

test('the static hero can shrink at 342px without clipping Georgian copy', () => {
  assert.match(landingHeroSource, /data-family-shell="true" className="hero-family-shell/u);
  assert.match(landingHeroSource, /className="grid min-w-0 gap-8/u);
  assert.match(landingHeroSource, /data-hero-primary="true"/u);
  assert.match(landingHeroSource, /className="hero-static-accent"/u);
  assert.doesNotMatch(landingHeroSource, /setInterval|setTimeout|caretW|availableWidth/u);
  assert.match(landingHeroCss, /\.hero-family-shell\{width:min\(1140px,calc\(100% - 48px\)\)/u);
  assert.match(landingHeroCss, /@media\(max-width:640px\)[^{]*\{[^}]*#hero\{padding-top:96px;/u);
});

test('the mobile menu target cannot shrink below 44px inside the family header', () => {
  assert.match(
    landingNavCss,
    /\.nav-burger\s*\{[\s\S]*?flex:\s*0 0 44px;[\s\S]*?width:\s*44px;[\s\S]*?height:\s*44px;/u,
  );
});

test('navigation controls expose localized state labels without claiming ARIA menu behavior', () => {
  assert.match(landingNavSource, /const NAV_A11Y = \{/u);
  assert.match(landingNavSource, /aria-label=\{menuOpen \? a11y\.close : a11y\.open\}/u);
  assert.match(landingNavSource, /aria-label=\{a11y\.language\}/u);
  assert.match(landingNavSource, /NAV_A11Y\[locale as keyof typeof NAV_A11Y\] \?\? NAV_A11Y\.en/u);
  assert.doesNotMatch(landingNavSource, /aria-haspopup="menu"/u);

  for (const [locale, messages] of Object.entries(locales)) {
    for (const key of ['openMenu', 'closeMenu', 'switchLanguage']) {
      assert.equal(typeof messages.landingNav?.[key], 'string', `${locale}.landingNav.${key}`);
      assert.ok(messages.landingNav[key].length > 0, `${locale}.landingNav.${key}`);
    }
  }
});

test('light-surface focus indicators use the contrast-safe lime ink', () => {
  assert.match(brandCss, /--ring:\s*var\(--brand-ink\);/u);
  assert.match(landingHeroCss, /\.btn-primary:focus-visible, \.btn-ghost:focus-visible/u);
  assert.match(landingHeroCss, /outline:\s*2px solid var\(--brand-ink\);/u);
  assert.match(landingNavCss, /outline:\s*2px solid var\(--brand-ink\);/u);
  assert.match(lightControlSources, /focus-visible:ring-\[var\(--brand-ink\)\]/u);
  assert.doesNotMatch(lightControlSources, /focus-visible:ring-\[var\(--brand\)\]/u);
  assert.match(sources['AppCost.tsx'], /focus-visible:ring-\[var\(--brand\)\]/u);
});

test('all public aiAPP namespaces are complete and aligned in KA, EN, and RU', () => {
  for (const namespace of PUBLIC_NAMESPACES) {
    const paths = Object.fromEntries(
      Object.entries(locales).map(([locale, messages]) => [
        locale,
        collectLeafPaths(messages.product?.[namespace]),
      ]),
    );
    assert.deepEqual(paths.ka, paths.en, namespace);
    assert.deepEqual(paths.ru, paths.en, namespace);
  }
});

test('each locale provides exactly five capability outcomes', () => {
  for (const [locale, messages] of Object.entries(locales)) {
    const capabilities = messages.product.capabilities;
    assert.deepEqual(Object.keys(capabilities.items), ['1', '2', '3', '4', '5'], locale);
    for (const item of Object.values(capabilities.items)) {
      assert.deepEqual(Object.keys(item).sort(), ['description', 'result', 'title']);
      assert.ok(Object.values(item).every((value) => typeof value === 'string' && value.length > 0));
    }
  }
});

test('the four business questions are visible in every language', () => {
  for (const [locale, messages] of Object.entries(locales)) {
    for (const namespace of ['eval', 'trace', 'cost', 'handoff']) {
      const heading = messages.product?.[namespace]?.heading;
      assert.equal(typeof heading, 'string', `${locale}.${namespace}.heading`);
      assert.match(heading, /\?$/u, `${locale}.${namespace}.heading`);
    }
  }
});

test('primary copy removes internal engineering vocabulary and first-person promises', () => {
  const banned = {
    en: /\b(?:evals?|traces?|tool calls?|prompt injection|guardrails?|repository|runbook|telemetry|orchestration)\b|\b(?:we|our)\b/iu,
    ka: /ევალ|ტრეის|ინსტრუმენტის გამოძახება|ინექცია|გარდრეილ|რეპოზიტორ|რანბუქ|ტელემეტრ|ორკესტრ|(?:^|[\s.,])ჩვენ(?:[\s.,]|$)/u,
    ru: /эвал|трейс|вызов инструмента|инъекц|гардрейл|репозитор|ранбук|телеметр|оркестр|\bмы\b|\bнаш(?:а|е|и|их|ему|ей|им)?\b/iu,
  };

  for (const [locale, messages] of Object.entries(locales)) {
    const copy = PUBLIC_NAMESPACES
      .flatMap((namespace) => collectStrings(messages.product?.[namespace]))
      .join('\n');
    assert.doesNotMatch(copy, banned[locale], locale);
  }
});

test('aiNOW owns public commitments and Georgian copy contains no Cyrillic', () => {
  for (const [locale, messages] of Object.entries(locales)) {
    assert.match(messages.product.hero.commitment, /aiNOW/u, `${locale}.hero.commitment`);
    assert.match(messages.product.hero.signedBy, /^aiNOW/u, `${locale}.hero.signedBy`);
    assert.match(messages.product.cta.subtitle, /aiNOW/u, `${locale}.cta.subtitle`);
  }

  const georgian = JSON.stringify(locales.ka.product);
  assert.doesNotMatch(georgian, /[\u0400-\u04ff]/u);
});

test('the contact note is aiNOW-owned and makes no unsupported response-time promise', () => {
  const timePromises = {
    en: /business day|within\s+\d+|hours?|minutes?/iu,
    ka: /სამუშაო დღის|\d+\s*(?:საათ|წუთ)/u,
    ru: /рабочего дня|в течение\s+\d+|час(?:а|ов)?|минут/u,
  };

  for (const [locale, messages] of Object.entries(locales)) {
    const note = messages.product.cta.phoneNote;
    assert.match(note, /aiNOW/u, `${locale}.cta.phoneNote`);
    assert.doesNotMatch(note, timePromises[locale], `${locale}.cta.phoneNote`);
  }
});

test('the removed ecosystem slogan never returns', () => {
  for (const messages of Object.values(locales)) {
    for (const key of [
      'sloganCreates',
      'sloganAds',
      'sloganSells',
      'sloganManages',
      'sloganTogether',
    ]) {
      assert.equal(Object.hasOwn(messages.product.hero, key), false, key);
    }
  }
});

function collectLeafPaths(value, prefix = '') {
  assert.ok(value && typeof value === 'object', `missing namespace ${prefix}`);
  return Object.entries(value)
    .flatMap(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return child && typeof child === 'object' ? collectLeafPaths(child, path) : path;
    })
    .sort();
}

function collectStrings(value) {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(collectStrings);
}
