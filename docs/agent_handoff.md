# Agent Handoff

Dit document is bedoeld voor een nieuwe AI agent die dit project overneemt.

## Productdoel

Deze app is een lokaal prototype voor een latere online character/casting database.

De app begon als een prompt-first casting headshot generator, maar de richting is nu breder:

1. synthetische characters genereren
2. visuele morphology keys opslaan
3. prompts en negative prompts bouwen
4. rendered images koppelen aan de exacte keys waarmee ze gemaakt zijn
5. bestaande images later via een visual-language task omzetten naar dezelfde canonical keys
6. characters browsen/filteren
7. vanuit een bestaand character controlled variants genereren met slight deviation

Het einddoel is niet alleen een promptlijst, maar een herbruikbare character library.

## Belangrijkste Concepten

### Generated character

Een volledig gegenereerd `GeneratedPerson` record met identity/context, `visual` keys, prompt, negative prompt en later image assets.

### Extracted morphology

Een toekomstige import-output van een visual-language model:

- JSON only
- `schema_version`
- image quality metadata
- per field `{ value, confidence }`
- `unknown` voor velden die niet zichtbaar genoeg zijn
- uncertainty notes

Deze output moet later geparsed, gevalideerd, genormaliseerd en opgeslagen worden.

### Canonical visual keys

De centrale taxonomie van alle visuele velden. Generator, field data view, VL system prompt, parser, filters en promptbuilder moeten uiteindelijk uit dezelfde registry gevoed worden.

Dit bestaat nog niet als aparte registry. Nu zitten de waarden verspreid over:

- `src/data/options.ts`
- `src/data/regions.ts`
- `src/lib/phrases.ts`
- `src/types.ts`
- `src/App.tsx` field-data registry

Een belangrijke volgende stap is dit centraliseren.

## Belangrijkste Bestanden

- `src/App.tsx`
  UI, filters, single generation, batch generation, copy flow en `Field data` view.
- `src/lib/generator.ts`
  Hoofdgenerator en weighted sampling.
- `src/lib/promptBuilder.ts`
  Zet `GeneratedPerson` om naar prompt en negative prompt.
- `src/lib/phrases.ts`
  Interne keys naar prompttaal. Nog fragiel omdat het een grote gedeelde map is.
- `src/data/options.ts`
  Niet-regio-specifieke data/gewichten, inclusief veel morphology assen.
- `src/data/regions.ts`
  Region-weighted visual maps.
- `src/types.ts`
  Shared datamodel.

## Huidige UI

De gebruiker kan nu:

- `region profile` kiezen
- `age group` kiezen
- `gender presentation` kiezen
- `campaign type` kiezen
- een single person genereren
- een batch prompt list genereren
- generated JSON/prompt kopieren
- via `Field data` alle velden en mogelijke waarden inspecteren

## Toekomstige Views

### Character browser

Moet later prerendered characters tonen met hun gekoppelde image(s) en generation/import keys.

Benodigde filters:

- age group
- gender presentation
- campaign type
- region profile
- face shape
- head shape
- eye shape / color
- nose / mouth / brow keys
- hair style / hair color / hairline
- facial fullness / visible body build
- freckles / scars / tattoos / eyewear
- source: generated/imported/manual

### Character detail

Moet later tonen:

- linked rendered images
- canonical visual keys
- extraction confidence per field
- prompt en negative prompt
- raw extraction JSON indien imported
- variant history
- actions zoals `generate slight variation`, `copy prompt`, `rerender`, `edit keys`

### Visual extraction/import

Moet later:

1. een image accepteren
2. de VL system prompt genereren uit canonical schema
3. JSON output ontvangen
4. parse/validate/normalize uitvoeren
5. een `CharacterRecord` aanmaken of bijwerken

## Belangrijke Regels

- Region/culture beinvloedt kansen, nooit harde stereotypes.
- Demografische velden mogen niet automatisch traits sturen waar geen goede visuele/logische reden voor is.
- Expressions, pose, jewelry, piercings en tattoos moeten niet primair door leeftijd/gender/regio gestuurd worden.
- Age mag aging sturen.
- Age/gender mag hairline/kaalheid en hairstyle compatibility sturen.
- Region mag broad visual probability maps sturen.
- Voor imported images: liever `unknown` dan gokken.
- Elke imported field moet confidence kunnen dragen.
- Images moeten gekoppeld blijven aan de keys waarmee ze gegenereerd of geimporteerd zijn.
- Variants moeten parent/lineage bewaren.

## Huidige Visual Scope

De `visual` sectie is inmiddels breed:

- face/head: `face_shape`, `head_shape`, `forehead_height`
- eyes/brows: `eye_color`, `eye_shape`, `eye_size`, `eye_spacing`, `canthal_tilt`, `under_eye_detail`, `eyelid_type`, `eyebrow_style`, `eyebrow_density`, `eyebrow_position`, `brow_ridge_prominence`
- nose/mouth: `nose_size`, `nose_length`, `nose_profile`, `nose_bridge_width`, `nose_tip_shape`, `nostril_width`, `nostril_visibility`, `mouth_width`, `mouth_shape`, `lip_fullness`, `cupid_bow_definition`, `philtrum_length`
- facial structure: `facial_fullness`, `visible_body_build`, `cheek_fullness`, `cheekbone_height`, `cheekbone_prominence`, `jaw_shape`, `chin_shape`, `neck_width`, `shoulder_frame`
- skin/aging: `skin_tone`, `skin_undertone`, `skin_texture`, `wrinkle_level`, `crow_feet`, `nasolabial_folds`, `pore_visibility`
- marks/details: `freckle_pattern`, `visible_scars`, `distinctive_features`, `tattoos`, `piercings`, `jewelry`, `eyewear`
- hair/grooming: `hair_color`, `hair_type`, `hair_length`, `hairstyle`, `hairstyle_presentation`, `hair_parting`, `hair_finish`, `hairline`, `facial_hair`
- expression/pose: `expression`, `gaze_direction`, `head_pose`

## Bekende Risico's

### `phrases.ts`

Nog steeds een groot gedeeld object. Dit is fragiel door key-collisions zoals `medium`, `long`, `full`, `dark_brown`.

Gewenste richting:

- domeinspecifieke phrase maps
- of een canonical field registry met prompt labels per value

### Alias normalisatie

Oude/import schemas kunnen waarden bevatten zoals:

- `almond`
- `round`
- `medium`
- `none_visible`

Terwijl de app canonical keys gebruikt of gaat gebruiken zoals:

- `almond_eyes`
- `round_eyes`
- `medium_size`
- lege arrays voor geen zichtbare details

Er moet later een import-normalizer komen.

### Prompt lengte

De visual schema wordt steeds rijker. Niet elk descriptorveld moet altijd in de final prompt. De promptbuilder moet uiteindelijk slim selecteren welke details relevant zijn.

### Buildstatus

Gebruik `npx vite build` als snelle sanity check. `npm run build` kan nog falen door bestaande TypeScript setup issues.

## Aanbevolen Volgende Stappen

1. Maak `src/schema/visualFields.ts` als canonical registry.
2. Laat `Field data` uit die registry renderen.
3. Genereer de visual-language system prompt uit die registry.
4. Bouw een parser/validator/normalizer voor pasted extraction JSON.
5. Maak een simpele import-preview view: plak JSON, zie normalized visual profile.
6. Split `phrases.ts` of koppel prompt labels aan de registry.
7. Ontwerp `CharacterRecord`, `CharacterImage` en variant lineage types.
8. Bouw later de character browser/filter view.
