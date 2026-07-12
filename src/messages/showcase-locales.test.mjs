import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const LOCALE_PATHS = {
  en: new URL('./en.json', import.meta.url),
  ka: new URL('./ka.json', import.meta.url),
  ru: new URL('./ru.json', import.meta.url),
};

const EXPECTED_KEYS = {
  eval: [
    'c1',
    'c2',
    'c3',
    'c4',
    'c5',
    'complete',
    'eyebrow',
    'heading',
    'note',
    'outcome',
    'ready',
    'replay',
    'review',
    'stopped',
    'subtitle',
  ],
  trace: [
    'action',
    'actionDetail',
    'complete',
    'current',
    'customerResult',
    'customerResultDetail',
    'eyebrow',
    'heading',
    'outcome',
    'replay',
    'request',
    'requestDetail',
    'resultLabel',
    'safetyCheck',
    'safetyCheckDetail',
    'subtitle',
    'waiting',
  ],
  handoff: [
    'ainow',
    'client',
    'code',
    'complete',
    'custody',
    'documentation',
    'eyebrow',
    'heading',
    'hostingAccess',
    'moving',
    'operatingControl',
    'outcome',
    'pending',
    'ready',
    'replay',
    'serviceAccounts',
    'subtitle',
  ],
  cost: [
    'complexity',
    'conversations',
    'eyebrow',
    'heading',
    'm1',
    'm2',
    'm3',
    'monthly',
    'note',
    'perMonth',
    'replay',
    'result',
    'steps',
    'subtitle',
    'usage',
  ],
  ladder: [
    'credit',
    'eyebrow',
    'heading',
    'note',
    'r1',
    'r1price',
    'r1risk',
    'r1time',
    'r1what',
    'r2',
    'r2price',
    'r2risk',
    'r2time',
    'r2what',
    'r3',
    'r3price',
    'r3risk',
    'r3time',
    'r3what',
    'replay',
    'subtitle',
    'youPay',
  ],
  proof: [
    'action',
    'actionDetail',
    'check',
    'checkDetail',
    'label',
    'outcome',
    'replay',
    'request',
    'requestDetail',
    'result',
    'resultDetail',
  ],
};

const locales = Object.fromEntries(
  Object.entries(LOCALE_PATHS).map(([locale, path]) => [
    locale,
    JSON.parse(readFileSync(path, 'utf8')),
  ]),
);

for (const [namespace, expectedKeys] of Object.entries(EXPECTED_KEYS)) {
  test(`product.${namespace} has the same complete key paths in en, ka, and ru`, () => {
    const pathsByLocale = Object.fromEntries(
      Object.entries(locales).map(([locale, messages]) => {
        const value = messages.product?.[namespace];
        assert.ok(value, `${locale}.json is missing product.${namespace}`);
        return [locale, collectLeafPaths(value)];
      }),
    );

    assert.deepEqual(pathsByLocale.en, expectedKeys);
    assert.deepEqual(pathsByLocale.ka, pathsByLocale.en);
    assert.deepEqual(pathsByLocale.ru, pathsByLocale.en);
  });
}

test('Georgian showcase copy contains no Cyrillic characters', () => {
  const copy = JSON.stringify(
    Object.fromEntries(Object.keys(EXPECTED_KEYS).map((key) => [key, locales.ka.product?.[key]])),
  );
  assert.doesNotMatch(copy, /[\u0400-\u04ff]/u);
});

function collectLeafPaths(value, prefix = '') {
  return Object.entries(value)
    .flatMap(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return child && typeof child === 'object' ? collectLeafPaths(child, path) : path;
    })
    .sort();
}
