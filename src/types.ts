/**
 * Whether an instrument is pitched (melodic) or unpitched (percussion / drum-style kit).
 */
export type InstrumentType = 'pitched' | 'unpitched';

/**
 * A single instrument in Flat's public catalog.
 */
export interface Instrument {
  /** Canonical instrument ID in `group.instrument` form, e.g. `"keyboards.piano"`. */
  id: string;
  /** Group / family ID this instrument belongs to, e.g. `"keyboards"`. */
  group: string;
  /** English display name, e.g. `"Piano"`. */
  name: string;
  /** Short English label used on staves, e.g. `"Pno."`. */
  shortname: string;
  /** `"pitched"` for melodic instruments, `"unpitched"` for percussion / drum-style kits. */
  type: InstrumentType;
  /** `true` when the instrument requires a paid Flat plan. */
  premium: boolean;
}

/**
 * A group / family of instruments (e.g. Keyboards, Brass), in catalog display order.
 */
export interface InstrumentGroup {
  /** Group ID, e.g. `"keyboards"`. */
  id: string;
  /** English display name, e.g. `"Keyboards"`. */
  name: string;
  /** Instruments in this group, in catalog display order. */
  instruments: Instrument[];
}

/**
 * Top-level shape of `data/instruments.json` — the published catalog.
 */
export interface InstrumentsFile {
  /** All instrument groups, in catalog display order. */
  groups: InstrumentGroup[];
}
