import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const LOCALE_PATHS = {
  en: new URL('./en.json', import.meta.url),
  ka: new URL('./ka.json', import.meta.url),
  ru: new URL('./ru.json', import.meta.url),
};

const EXPECTED_KEYS = {
  trace: [
    'answerChannel',
    'answerDelivered',
    'answerHeld',
    'badPath',
    'blocked',
    'correctTool',
    'customerRequest',
    'eyebrow',
    'guardrail',
    'heading',
    'outcome',
    'passed',
    'redacted',
    'replay',
    'request',
    'response',
    'subtitle',
    'toolCall',
    'wrongTool',
  ],
  handoff: [
    'agency',
    'canOperate',
    'client',
    'complete',
    'custody',
    'evalSuite',
    'eyebrow',
    'heading',
    'hosting',
    'modelAccount',
    'outcome',
    'owner',
    'pending',
    'replay',
    'repository',
    'runbook',
    'subtitle',
    'transferred',
    'transferring',
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

test('new Georgian showcase copy contains no Cyrillic characters', () => {
  const copy = JSON.stringify({
    trace: locales.ka.product?.trace,
    handoff: locales.ka.product?.handoff,
  });

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
