// Tests run against the built package (dist/) so they exercise the actual published artifact,
// including the runtime resolution of data/instruments.json. Run `pnpm build` first.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getInstrument,
  groups,
  instruments,
  isValidInstrumentId,
} from '../dist/src/index.js';

test('exposes a non-empty catalog', () => {
  assert.ok(groups.length > 0, 'expected at least one group');
  assert.ok(instruments.length > 0, 'expected at least one instrument');
});

test('groups flatten into the instruments list in order', () => {
  const fromGroups = groups.flatMap(group => group.instruments.map(instrument => instrument.id));
  assert.deepEqual(
    instruments.map(instrument => instrument.id),
    fromGroups,
  );
});

test('every instrument id round-trips through getInstrument', () => {
  for (const instrument of instruments) {
    assert.equal(getInstrument(instrument.id), instrument);
    assert.equal(isValidInstrumentId(instrument.id), true);
  }
});

test('ids follow the group.instrument format and match their group', () => {
  for (const group of groups) {
    for (const instrument of group.instruments) {
      assert.equal(instrument.group, group.id);
      assert.ok(instrument.id.startsWith(`${group.id}.`), `bad id: ${instrument.id}`);
    }
  }
});

test('ids are unique', () => {
  const ids = new Set(instruments.map(instrument => instrument.id));
  assert.equal(ids.size, instruments.length);
});

test('known instruments resolve with expected shape', () => {
  const piano = getInstrument('keyboards.piano');
  assert.ok(piano, 'keyboards.piano should exist');
  assert.equal(piano.name, 'Piano');
  assert.equal(piano.type, 'pitched');
  assert.equal(piano.premium, false);
});

test('unknown ids return undefined and are invalid', () => {
  assert.equal(getInstrument('nope.nope'), undefined);
  assert.equal(isValidInstrumentId('nope.nope'), false);
  assert.equal(isValidInstrumentId('piano'), false);
});

test('type is always pitched or unpitched', () => {
  for (const instrument of instruments) {
    assert.ok(
      instrument.type === 'pitched' || instrument.type === 'unpitched',
      `bad type for ${instrument.id}: ${instrument.type}`,
    );
  }
});
