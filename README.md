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

## Raw JSON

If you are not using JavaScript, the same data is available as plain JSON, bundled in this package at
[`data/instruments.json`](./data/instruments.json)
(validated against [`schema/instruments.schema.json`](./schema/instruments.schema.json)).

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
