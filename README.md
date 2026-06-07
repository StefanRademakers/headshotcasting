# AI Casting Headshot Generator

Prototype React + TypeScript app for generating data-driven casting characters, photorealistic headshot prompts, and eventually a reusable character/image database.

This project is not just a random-person generator. It is an early local prototype for a later online system where generated or imported character records can be browsed, filtered, reused, and varied.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npx vite build
```

`npm run build` may still expose older TypeScript setup issues in this prototype. `npx vite build` is currently the practical app sanity check.

## Current App

- Generate one synthetic casting character.
- Generate batch prompt lists of `100`, `500`, or `1000`.
- Control generation by region profile, age group, gender presentation, and campaign type.
- Build a structured `GeneratedPerson` JSON object.
- Build a photorealistic headshot prompt and negative prompt.
- Inspect all current field data in the `Field data` view.
- Copy a dynamically generated visual-language extraction system prompt in the `VL prompt` view.
- Paste visual extraction JSON and convert it into a prompt preview in the `Import JSON` view.
- Copy generated JSON, prompts, and field data.

## Long-Term Target

The intended product direction is a character library for casting and image-generation workflows.

Future records should be able to store:

- canonical generation keys / morphology keys
- generated prompt text
- linked rendered images
- imported source images
- visual extraction metadata with confidence scores
- tags and filtering metadata
- variant lineage, for example a new render generated from an existing character with slight deviations

The app should eventually include a character browser where prerendered characters can be filtered by fields such as age group, face shape, head shape, eye shape, body build, freckles, hair style, campaign type, and other visual keys.

## Character Database Direction

A future `CharacterRecord` should likely contain:

```ts
type CharacterRecord = {
  id: string;
  source: "generated" | "imported_image" | "manual";
  visual: VisualProfile;
  prompt_description: string;
  negative_prompt: string;
  images: CharacterImage[];
  extraction?: VisualExtractionRecord;
  tags: string[];
  parent_character_id?: string;
  variant_notes?: string;
};
```

Images must stay connected to the exact generation/import keys that produced or describe them. That connection is essential for browsing, filtering, reproducing, and generating controlled variants.

## Image-To-Keys Direction

Later, the app should include a visual-language task that analyzes an uploaded image and returns structured JSON with:

- `schema_version`
- `image_quality`
- grouped visual fields
- `{ value, confidence }` per field
- `unknown` when a field is not visible enough
- uncertainty notes

The visual-language system prompt should not be hand-maintained separately. It should eventually be generated from the same canonical field registry used by the generator, parser, prompt builder, and field data view.

Target flow:

1. User uploads or selects an image.
2. App generates the VL system prompt from the canonical schema.
3. VL model returns JSON only.
4. App parses and validates the JSON.
5. App normalizes aliases to canonical keys.
6. App stores raw extraction plus normalized `VisualProfile`.
7. Character can be browsed, filtered, prompted, or used as the basis for variants.

## Important Design Principles

- Region and culture influence weighted probabilities, not fixed stereotypes.
- Demographic fields should not drive traits that they should not logically drive.
- Physical morphology, styling, expression, campaign context, and image metadata should remain separate layers.
- Use `unknown` and confidence scores for imported visual extraction instead of guessing.
- The canonical visual key set must be broad enough to describe real imported images, not only generate random synthetic people.
- Prompt output should be natural image-generation language, not raw tags.
- Not every stored descriptor should always appear in the final prompt; the prompt builder should select useful visible details.

## Current Architecture

- `src/App.tsx`
  UI, filters, single generation, batch generation, copy flow, and field data inspection.
- `src/lib/generator.ts`
  Main generation logic and weighted sampling.
- `src/lib/promptBuilder.ts`
  Converts a `GeneratedPerson` into image-generation prompt text.
- `src/lib/phrases.ts`
  Maps internal keys to readable prompt language.
- `src/data/options.ts`
  Non-region-specific option maps and weights.
- `src/data/regions.ts`
  Region visual profiles with weighted probability maps.
- `src/types.ts`
  Shared data model types.

## Near-Term Engineering Targets

1. Create a canonical visual field registry.
2. Generate the `Field data` view from that registry.
3. Generate the visual-language extraction system prompt from that registry.
4. Add a JSON parser/validator/normalizer for imported extraction output.
5. Split `phrases.ts` into domain-specific phrase maps.
6. Normalize remaining legacy aliases such as `medium`/`medium_size` and old eye-shape values.
7. Add a character browser view with filters once records/images exist.
8. Add variant generation from an existing character with controlled slight deviations.
