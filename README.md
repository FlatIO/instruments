# @flat/instruments

The public catalog of musical **instrument IDs** used by the [Flat](https://flat.io) platform and API.

When you create scores or correct OMR-detected parts through the
[Flat API](https://flat.io/developers/docs), each instrument is referenced by a canonical ID in
`group.instrument` form — for example `keyboards.piano`, `brass.trumpet`, or
`unpitched-percussion.drumset-rock`. This package is the discoverable, typed list of those IDs.

> Looking for the human-readable reference? See the
> [Instruments page in the Flat developer docs](https://flat.io/developers/docs/api/instruments).

## Installation

```bash
npm install @flat/instruments
```

## Usage

```ts
import { instruments, groups, getInstrument, isValidInstrumentId } from '@flat/instruments';

instruments.length;                       // → every instrument, in catalog order
getInstrument('keyboards.piano');         // → { id, group, name, shortname, type, premium }
getInstrument('nope.nope');               // → undefined
isValidInstrumentId('brass.trumpet');     // → true

// Grouped by family (Keyboards, Brass, Strings, …), in display order:
for (const group of groups) {
  console.log(group.name, group.instruments.map(i => i.id));
}
```

Each instrument has the following shape:

```ts
interface Instrument {
  id: string;          // canonical "group.instrument" ID, e.g. "keyboards.piano"
  group: string;       // family ID, e.g. "keyboards"
  name: string;        // English display name, e.g. "Piano"
  shortname: string;   // short staff label, e.g. "Pno."
  type: 'pitched' | 'unpitched';
  premium: boolean;    // true → requires a paid Flat plan
}
```

## Localized names

`data/instruments.json` carries English names. Every other locale is available as a **complete,
drop-in catalog** with the exact same shape under `data/i18n/<lang>.json` — every group and
instrument is present, with localized `name` and `shortname` (falling back to English wherever no
translation exists). You load the one file for the locale you need; there is nothing to merge.

```ts
import type { InstrumentsFile } from '@flat/instruments';
import fr from '@flat/instruments/data/i18n/fr.json' with { type: 'json' };

const catalog = fr as InstrumentsFile;
catalog.groups[0].name;                                       // → "Cuivres"
catalog.groups
  .flatMap(g => g.instruments)
  .find(i => i.id === 'brass.trumpet');                       // → { …, name: "Trompette", shortname: "Tromp." }
```

Available locales: `da`, `de`, `en-GB`, `es`, `fi`, `fil`, `fr`, `fr-CA`, `hi`, `id`, `it`, `ja`,
`ja-HIRA`, `ko`, `ms`, `nb`, `nl`, `pl`, `pt`, `pt-BR`, `ro`, `ru`, `sv`, `tr`, `zh-Hans`, `zh-HK`,
`zh-TW`. Each file validates against the same
[`schema/instruments.schema.json`](./schema/instruments.schema.json) and exposes the same instrument
IDs, in the same order, as `data/instruments.json` — only the names differ.

## Raw JSON

If you are not using JavaScript, the same data is available as plain JSON, bundled in this package at
[`data/instruments.json`](./data/instruments.json) (English) and
[`data/i18n/<lang>.json`](./data/i18n) (localized), both validated against
[`schema/instruments.schema.json`](./schema/instruments.schema.json).

## Development

```bash
pnpm install
pnpm build-schema   # regenerate schema/instruments.schema.json from src/types.ts
pnpm validate       # validate data/instruments.json against the schema + invariants
pnpm build          # compile to dist/
pnpm test           # run the test suite
```

## License

Proprietary — © Tutteo Limited. All rights reserved.

This package is published publicly so that Flat API consumers can discover valid instrument IDs.
It does not grant any license to use, copy, modify, or redistribute the package or its data.
