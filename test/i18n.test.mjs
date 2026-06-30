// Tests the localized catalogs in data/i18n/<lang>.json. Each one must be a complete, drop-in
// catalog: same shape and same instrument IDs (in the same order) as the English data, with only
// the names allowed to differ. Run `pnpm build` first (the English baseline comes from dist/).
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { test } from 'node:test';
import { groups, instruments } from '../dist/src/index.js';

const i18nDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/i18n');
const localeFiles = readdirSync(i18nDir)
  .filter(file => file.endsWith('.json'))
  .sort();
const loadCatalog = file => JSON.parse(readFileSync(path.join(i18nDir, file), 'utf8'));

const baseIds = instruments.map(instrument => instrument.id);

test('ships a localized catalog for every locale', () => {
  assert.ok(localeFiles.length >= 27, `expected the full locale set, got ${localeFiles.length}`);
});

test('every locale catalog mirrors the English structure exactly', () => {
  for (const file of localeFiles) {
    const catalog = loadCatalog(file);
    assert.equal(catalog.groups.length, groups.length, `${file}: group count`);

    const localeIds = catalog.groups.flatMap(group => group.instruments.map(i => i.id));
    assert.deepEqual(localeIds, baseIds, `${file}: instrument IDs and order must match English`);

    for (const group of catalog.groups) {
      for (const instrument of group.instruments) {
        const english = instruments.find(i => i.id === instrument.id);
        assert.equal(instrument.group, group.id, `${file}: ${instrument.id} group`);
        // Names are localized; everything else is locale-independent and must match English.
        assert.equal(instrument.type, english.type, `${file}: ${instrument.id} type`);
        assert.equal(instrument.premium, english.premium, `${file}: ${instrument.id} premium`);
        assert.equal(typeof instrument.name, 'string', `${file}: ${instrument.id} name`);
        assert.ok(instrument.name.length > 0, `${file}: ${instrument.id} empty name`);
        assert.equal(typeof instrument.shortname, 'string', `${file}: ${instrument.id} shortname`);
      }
    }
  }
});

test('translations are applied (fr)', () => {
  const fr = loadCatalog('fr.json');
  const trumpet = fr.groups
    .flatMap(group => group.instruments)
    .find(instrument => instrument.id === 'brass.trumpet');
  assert.equal(trumpet.name, 'Trompette');
  assert.equal(trumpet.shortname, 'Tromp.');

  const brass = fr.groups.find(group => group.id === 'brass');
  assert.equal(brass.name, 'Cuivres');
});

test('untranslated names fall back to English (fr piano)', () => {
  const fr = loadCatalog('fr.json');
  const piano = fr.groups
    .flatMap(group => group.instruments)
    .find(instrument => instrument.id === 'keyboards.piano');
  assert.equal(piano.name, 'Piano');
});
