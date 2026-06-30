// Validates data/instruments.json and every localized data/i18n/<lang>.json against the JSON
// Schema, plus cross-field invariants the schema cannot express (id format, group consistency,
// ID uniqueness). Localized catalogs share the same shape as the English one, and must also expose
// the exact same set of group/instrument IDs in the same order — only names are allowed to differ.
// Run with: pnpm validate
import Ajv from 'ajv';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const schema = JSON.parse(readFileSync(path.join(root, 'schema/instruments.schema.json'), 'utf8'));
const validate = new Ajv({ allErrors: true }).compile(schema);

let failed = false;
const fail = message => {
  console.error(message);
  failed = true;
};

// Validates one catalog's schema + cross-field invariants. Returns the ordered list of instrument
// IDs (or null when the schema check fails), so callers can compare structure across locales.
function validateCatalog(label, data) {
  if (!validate(data)) {
    fail(`${label}: schema validation failed: ${JSON.stringify(validate.errors)}`);
    return null;
  }

  const ids = [];
  const seen = new Set();
  for (const group of data.groups) {
    for (const instrument of group.instruments) {
      if (instrument.group !== group.id) {
        fail(`${label}: "${instrument.id}" is listed under "${group.id}" but has group="${instrument.group}"`);
      }
      if (!instrument.id.startsWith(`${group.id}.`)) {
        fail(`${label}: id "${instrument.id}" does not start with group prefix "${group.id}."`);
      }
      if (seen.has(instrument.id)) {
        fail(`${label}: duplicate id "${instrument.id}"`);
      }
      seen.add(instrument.id);
      ids.push(instrument.id);
    }
  }
  return ids;
}

const data = JSON.parse(readFileSync(path.join(root, 'data/instruments.json'), 'utf8'));
const baseIds = validateCatalog('data/instruments.json', data);

let localeCount = 0;
const i18nDir = path.join(root, 'data/i18n');
for (const file of readdirSync(i18nDir).sort()) {
  if (!file.endsWith('.json')) {
    continue;
  }
  localeCount += 1;
  const rel = `data/i18n/${file}`;
  const localized = JSON.parse(readFileSync(path.join(i18nDir, file), 'utf8'));
  const localeIds = validateCatalog(rel, localized);
  // A localized catalog must mirror the English one exactly (same IDs, same order).
  if (baseIds && localeIds && JSON.stringify(baseIds) !== JSON.stringify(localeIds)) {
    fail(`${rel}: instrument IDs do not match data/instruments.json (same set and order required)`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `data/instruments.json valid — ${baseIds.length} instruments across ${data.groups.length} groups, ` +
    `plus ${localeCount} localized catalogs`,
);
