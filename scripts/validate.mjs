// Validates data/instruments.json against the JSON Schema, plus cross-field invariants
// the schema cannot express (id format, group consistency, ID uniqueness).
// Run with: pnpm validate
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const schema = JSON.parse(readFileSync(path.join(root, 'schema/instruments.schema.json'), 'utf8'));
const data = JSON.parse(readFileSync(path.join(root, 'data/instruments.json'), 'utf8'));

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

let failed = false;

if (!validate(data)) {
  console.error('Schema validation failed:', validate.errors);
  failed = true;
}

const seen = new Set();
for (const group of data.groups) {
  for (const instrument of group.instruments) {
    if (instrument.group !== group.id) {
      console.error(
        `group mismatch: "${instrument.id}" is listed under "${group.id}" but has group="${instrument.group}"`,
      );
      failed = true;
    }
    if (!instrument.id.startsWith(`${group.id}.`)) {
      console.error(`id "${instrument.id}" does not start with group prefix "${group.id}."`);
      failed = true;
    }
    if (seen.has(instrument.id)) {
      console.error(`duplicate id: "${instrument.id}"`);
      failed = true;
    }
    seen.add(instrument.id);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`data/instruments.json valid — ${seen.size} instruments across ${data.groups.length} groups`);
