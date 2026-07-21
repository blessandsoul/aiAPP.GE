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
    'answerLabel',
    'answerReady',
    'answerText',
    'businessResult',
    'businessResultLabel',
    'customerLabel',
    'customerMessage',
    'eyebrow',
    'heading',
    'orderFound',
    'orderNumber',
    'ownerChecked',
    'replay',
    'sampleLabel',
    'subtitle',
  ],
  trace: [
    'action',
    'actionDetail',
    'businessResult',
    'businessResultLabel',
    'customerResult',
    'customerResultDetail',
    'eyebrow',
    'heading',
    'invoiceNumber',
    'outcome',
    'outcomeLabel',
    'replay',
    'request',
    'requestDetail',
    'safetyCheck',
    'safetyCheckDetail',
    'sampleLabel',
    'subtitle',
  ],
  handoff: [
    'ainow',
    'businessResult',
    'businessResultLabel',
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
    'projectLabel',
    'projectName',
    'ready',
    'replay',
    'serviceAccounts',
    'subtitle',
  ],
  cost: [
    'businessResult',
    'businessResultLabel',
    'conversations',
    'eyebrow',
    'heading',
    'monthly',
    'note',
    'perMonth',
    'replay',
    'steps',
    'subtitle',
    'usage',
  ],
  ladder: [
    'businessResult',
    'businessResultLabel',
    'eyebrow',
    'heading',
    'next',
    'r1',
    'r1highlight',
    'r1price',
    'r1time',
    'r1what',
    'r2',
    'r2highlight',
    'r2price',
    'r2time',
    'r2what',
    'r3',
    'r3highlight',
    'r3price',
    'r3time',
    'r3what',
    'replay',
    'stageLabel',
    'subtitle',
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
