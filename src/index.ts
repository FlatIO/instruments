import rawData from '../data/instruments.json';
import type { Instrument, InstrumentGroup, InstrumentType } from './types';

export type { Instrument, InstrumentGroup, InstrumentType, InstrumentsFile } from './types';

function toInstrumentType(value: string, id: string): InstrumentType {
  if (value === 'pitched' || value === 'unpitched') {
    return value;
  }
  throw new Error(`Invalid instrument type "${value}" for instrument "${id}"`);
}

/** All instrument groups, in catalog display order. */
export const groups: InstrumentGroup[] = rawData.groups.map(group => ({
  id: group.id,
  name: group.name,
  instruments: group.instruments.map(instrument => ({
    id: instrument.id,
    group: instrument.group,
    name: instrument.name,
    shortname: instrument.shortname,
    type: toInstrumentType(instrument.type, instrument.id),
    premium: instrument.premium,
  })),
}));

/** Flat list of every instrument, in catalog display order. */
export const instruments: Instrument[] = groups.flatMap(group => group.instruments);

const byId = new Map<string, Instrument>(
  instruments.map(instrument => [instrument.id, instrument]),
);

/**
 * Look up an instrument by its canonical `group.instrument` ID.
 *
 * @returns the instrument, or `undefined` if the ID is unknown.
 */
export function getInstrument(id: string): Instrument | undefined {
  return byId.get(id);
}

/** Whether `id` is a known canonical instrument ID. */
export function isValidInstrumentId(id: string): boolean {
  return byId.has(id);
}
