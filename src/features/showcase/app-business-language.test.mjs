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
const landingHeroSource = readFileSync(
  new URL('../home/components/LandingHero.tsx', import.meta.url),
  'utf8',
);
const landingHeroCss = readFileSync(
  new URL('../home/components/landing-hero.css', import.meta.url),
  'utf8',
);
const landingNavCss = readFileSync(
  new URL('../home/components/landing-nav.css', import.meta.url),
  'utf8',
);

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
];

test('the primary application story is readable business UI, not JSON or terminal output', () => {
  const primary = `${sources['AppEval.tsx']}\n${sources['AppTraceReplay.tsx']}`;

  for (const term of ['trace_id', 'tool_call', 'prompt injection', 'eval suite']) {
    assert.doesNotMatch(primary, new RegExp(term, 'iu'), term);
  }
  assert.doesNotMatch(primary, /JSON\.stringify|<pre|<code/u);
});

test('every aiAPP demo uses the bundled Solar Ico registry without decorative glyphs', () => {
  for (const [component, source] of Object.entries(sources)) {
    assert.match(source, /import \{ Ico \} from '@\/components\/common\/Ico';/u, component);
    assert.match(source, /<Ico/u, component);
    assert.doesNotMatch(source, /lucide-react/u, component);
    assert.doesNotMatch(source, /<svg/u, component);
    assert.doesNotMatch(source, />\s*[!+×✓→←]\s*</u, component);
    assert.doesNotMatch(source, /\buppercase\b/u, component);
  }
});

test('Cost and Ladder remain visible visitor controls with Replay', () => {
  for (const component of ['AppCost.tsx', 'AppLadder.tsx']) {
    const source = sources[component];
    assert.match(source, /aria-(?:pressed|expanded)|type="range"/u, component);
    assert.match(source, /t\('replay'\)/u, component);
    assert.match(source, /solar:refresh-bold-duotone/u, component);
  }
});

test('the showcase order explains work, checking, cost, offer, and ownership', () => {
  assert.doesNotMatch(landingShowcaseSource, /eval suite|dev-tool|trace JSON/iu);
  assert.match(
    landingShowcaseSource,
    /<AppEval\s*\/>[\s\S]*<AppTraceReplay\s*\/>[\s\S]*<AppCost\s*\/>[\s\S]*<AppLadder\s*\/>[\s\S]*<AppSafeHandoff\s*\/>/u,
  );
});

test('the hero CTA uses the bundled icon and keeps audience copy in sentence case', () => {
  assert.doesNotMatch(landingHeroSource, /<svg/u);
  assert.match(landingHeroSource, /solar:arrow-right-bold-duotone/u);
  assert.doesNotMatch(landingHeroSource, /hero-audience[^"\n]*\buppercase\b/u);
});

test('the hero can shrink at 342px even when Georgian typewriter phrases are long', () => {
  assert.match(
    landingHeroSource,
    /className="w-full min-w-0 max-w-\[1180px\] mx-auto relative z-10"/u,
  );
  assert.match(landingHeroSource, /className="grid min-w-0 gap-8/u);
  assert.match(landingHeroSource, /hero-tagline w-full min-w-0/u);
  assert.match(
    landingHeroSource,
    /window\.innerWidth < 768[\s\S]*el\.style\.minWidth = '0px'/u,
  );
  assert.match(
    landingHeroCss,
    /@media \(max-width: 767px\)[\s\S]*\.typewriter[\s\S]*white-space: normal/u,
  );
});

test('the mobile menu target cannot shrink below 44px inside the family header', () => {
  assert.match(
    landingNavCss,
    /\.nav-burger\s*\{[\s\S]*?flex:\s*0 0 44px;[\s\S]*?width:\s*44px;[\s\S]*?height:\s*44px;/u,
  );
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
