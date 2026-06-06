# Agent Handoff

Dit document is bedoeld voor een nieuwe AI agent die dit project overneemt.

## Doel van de app

Deze app is geen generieke random-person generator, maar een `prompt-first casting headshot generator`.

De output moet:

- bestuurbaar zijn via filters in de linker kolom
- voldoende visuele variatie geven voor grote batches
- bruikbaar zijn als image-generation prompt
- realistisch ogen, dus niet te perfect, niet te generiek, en niet te stereotype

De kern van het product is:

1. een synthetisch persoon genereren
2. daar een fotorealistische headshot prompt van bouwen
3. ook een negative prompt meegeven
4. in batchmodus veel prompts genereren die niet allemaal op elkaar lijken

## Belangrijkste bestanden

- [src/App.tsx](/Users/stefanrademakers/Mediavibe/ai-casting-headshot-generator/src/App.tsx:1)
  De UI, filters, single generation, batch generation en copy flow.
- [src/lib/generator.ts](/Users/stefanrademakers/Mediavibe/ai-casting-headshot-generator/src/lib/generator.ts:1)
  De hoofdgenerator. Hier wordt bijna alle selectie- en batchlogica afgehandeld.
- [src/lib/promptBuilder.ts](/Users/stefanrademakers/Mediavibe/ai-casting-headshot-generator/src/lib/promptBuilder.ts:1)
  Zet een `GeneratedPerson` om in een image-generation prompt en negative prompt.
- [src/lib/phrases.ts](/Users/stefanrademakers/Mediavibe/ai-casting-headshot-generator/src/lib/phrases.ts:1)
  Mapping van interne ids naar leesbare prompttaal.
- [src/data/options.ts](/Users/stefanrademakers/Mediavibe/ai-casting-headshot-generator/src/data/options.ts:1)
  Vrijwel alle niet-regio-specifieke datasets en gewichten.
- [src/data/regions.ts](/Users/stefanrademakers/Mediavibe/ai-casting-headshot-generator/src/data/regions.ts:1)
  De regio-profielen met weighted visual maps.
- [src/types.ts](/Users/stefanrademakers/Mediavibe/ai-casting-headshot-generator/src/types.ts:1)
  Type-definities voor het hele datamodel.
- [src/main.tsx](/Users/stefanrademakers/Mediavibe/ai-casting-headshot-generator/src/main.tsx:1)
  App bootstrapping plus een simpele error boundary tegen volledig zwart scherm.

## Hoe de app werkt

### 1. UI flow

De gebruiker kiest links:

- `region profile`
- `age group`
- `gender presentation`
- `campaign type`

Daarna zijn er twee paden:

- `Generate person`
  Genereert exact één persoon en toont profiel + prompt + negative prompt.
- `Generate person list`
  Genereert `100`, `500` of `1000` prompts en zet die als één-regel-prompts in een textarea en op het clipboard.

### 2. Single generation

`App.tsx` roept `generatePerson()` aan uit `generator.ts`.

Globale flow:

1. regio wordt resolved
2. age group wordt resolved
3. gender presentation wordt resolved
4. visuele kenmerken worden gesampled
5. identity/casting metadata wordt toegevoegd
6. `promptBuilder.ts` maakt de headshot prompt

### 3. Region logic

Er zijn twee hoofdmodi:

- expliciete regio
  Dan wordt het gekozen regio-profiel gebruikt uit `regions.ts`
- `Random global`
  Dit gebruikt niet zomaar een random regio, maar een neutralere samengestelde mix

Dat is bewust gedaan om full-random minder scheef en minder bias-heavy te maken.

### 4. Visual profile

De `visual` sectie in `GeneratedPerson` bevat inmiddels veel meer dan alleen basismorfologie.

Belangrijke groepen:

- basisvormen
  `face_shape`, `head_shape`, `jaw_shape`, `nose_profile`, `nose_size`
- huid en veroudering
  `skin_tone`, `skin_undertone`, `skin_texture`, `wrinkle_level`, `crow_feet`, `nasolabial_folds`, `pore_visibility`
- ogen en brows
  `eye_color`, `eye_shape`, `eyelid_type`, `eyebrow_style`
- haar
  `hair_color`, `hair_type`, `hair_length`, `hairstyle`, `hairline`, `hair_parting`, `hair_finish`
- grooming en accessories
  `facial_hair`, `eyewear`, `piercings`, `jewelry`, `tattoos`
- realism details
  `visible_scars`, `distinctive_features`, `facial_asymmetry`
- styling / portrait behavior
  `cultural_styling`, `expression`, `gaze_direction`, `head_pose`

### 5. Prompt building

`buildHeadshotPrompt()` neemt die hele `GeneratedPerson` en bouwt daar één lange natuurlijke prompt van.

Belangrijke eigenschap:

- de prompt is bedoeld voor image generation
- dus niet alleen data dumpen, maar visueel leesbare taal gebruiken
- dingen zoals hair, pose, realism details en styling worden expliciet uitgeschreven

### 6. Batch generation

`generatePersonBatch()` heeft twee modi:

- gewone batch
  Als de gebruiker iets gefilterd heeft, respecteert de batchgenerator die filters gewoon en maakt hij herhaald single generations.
- balanced full-random batch
  Alleen wanneer `region`, `age group` en `gender presentation` alle drie op `random` staan

Die balanced full-random batch gebruikt decks en neutralere distributies om te voorkomen dat 100 prompts bijna dezelfde familie worden.

## Hoe ik het heb aangepakt

De aanpak was niet: “meer random maken”.

De aanpak was:

1. eerst de generator inhoudelijk lezen
2. begrijpen waar te weinig variatie vandaan kwam
3. daarna echte visuele assen toevoegen die een beeldmodel ook begrijpt

Belangrijke beslissingen:

- `Random global` neutraler gemaakt
  Anders bleef full-random te donker/te bruin en te region-biased.
- batch balancing toegevoegd
  Niet overal, alleen voor full-random batches, zodat de linker kolom altijd leidend blijft.
- haar opgesplitst in meerdere dimensies
  Niet alleen `hair_type` en `hair_length`, maar ook `hairstyle`, `hairline`, `hair_parting`, `hair_finish`.
- promptability als criterium gebruikt
  Alleen dingen toevoegen die in een headshot zichtbaar zijn en die een image model echt kan interpreteren.
- niet-perfecte mensen expliciet gemaakt
  Asymmetrie, littekens, tattoos, lichte expressie- en poseverschillen.

## Variatieverbeteringen die al zijn gedaan

De grote variatieverbeteringen staan ook apart in [docs/updates.md](/Users/stefanrademakers/Mediavibe/ai-casting-headshot-generator/docs/updates.md:1), maar inhoudelijk kwamen ze neer op:

- neutralere full-random regio-aanpak
- balanced batch generation
- veel rijkere hair system
- baldness / hairline realism
- piercings, tattoos, jewelry, eyewear
- scars, asymmetry, distinctive features
- cultural styling cues
- lichte expression / gaze / head pose variatie

## Dingen waar expliciet op gelet is

### Linker kolom moet altijd gerespecteerd worden

Dat was een harde eis van de gebruiker.

Dus:

- kiest de gebruiker `Western Europe`, dan moet de batch dat volgen
- kiest de gebruiker `male_presenting`, dan moeten hairstyle constraints dat volgen
- kiest de gebruiker alles random, dan mag je extra batch balancing inzetten

### Niet alles is wenselijk voor headshots

Veel variatie-ideeën klinken goed, maar zijn niet zichtbaar of niet bruikbaar in een close portrait.

Daarom zijn vooral toegevoegd:

- neck / collarbone tattoos
- visible jewelry
- visible eyewear
- subtle scars near face
- styling cues rond hoofd, nek en schouders

En dus niet allerlei lichaamsdetails die in een headshot toch niet zichtbaar zijn.

### Prompt leesbaarheid is belangrijk

Meer velden toevoegen is niet genoeg.

Als de prompt een onleesbare dump wordt:

- begrijpt een model hem slechter
- krijg je minder consistente visuele output

Daarom is de promptbuilder opgebouwd in korte semantische blokken:

- identity
- facial identity
- aging and realism
- pose and expression
- hair
- accessories and adornment
- styling / realism cues
- photography

## Bekende valkuilen

### 1. `phrases.ts` is nog een risicozone

De huidige `phraseMap` is een enkel groot object.

Dat werkt, maar is fragiel omdat verschillende domeinen key names delen, zoals eerder met `medium`, `long`, `red`, `dark_brown`.

Dat zou op termijn beter opgesplitst moeten worden in domeinspecifieke maps.

### 2. `display_name` en `model_code`

In `buildPerson()` wordt `makeCode()` nog twee keer aangeroepen, waardoor `display_name` en `model_code` kunnen divergeren.

Dat is een bekende dataconsistentie-bug.

### 3. Variatie is beter, maar nog niet volledig archetype-based

Veel features worden nog steeds onafhankelijk gesampled.

Dat betekent:

- de set is al veel beter
- maar je kunt nog steeds “dezelfde soort persoon met andere toggles” voelen

De volgende grote stap zou zijn:

- complete `look archetypes`
- dus samengestelde combinaties van haar + grooming + styling + realism cues + expression

### 4. Buildstatus

`npx vite build` werkt en is de snelste sanity check.

Historisch gezien was `npm run build` niet altijd groen door projectissues buiten de variatiewijzigingen.

Als je verder gaat werken, check beide buildpaden opnieuw.

## Aanbevolen werkwijze voor de volgende agent

Als je dit project uitbreidt:

1. begin in `src/lib/generator.ts`
2. check of een nieuw veld echt zichtbaar is in een headshot
3. voeg pas daarna data toe in `options.ts`
4. voeg daarna prompttaal toe in `phrases.ts` en `promptBuilder.ts`
5. verifieer daarna met `npx vite build`

Bij elke nieuwe variatievraag moet je jezelf afvragen:

- is dit visueel zichtbaar in een headshot?
- is dit begrijpelijk voor een image model?
- vergroot dit echte identiteit/silhouet-variatie, of alleen metadata?
- breekt dit de linker kolom filters niet?

## Goede volgende stappen

De beste vervolgstappen zijn waarschijnlijk:

- `look archetypes` toevoegen in plaats van alleen losse attributes
- `phrases.ts` opschonen in domeinspecifieke phrase maps
- eventueel een expliciete toggle tussen
  - `balanced random`
  - `region-weighted random`
  - `realism-first random`

## Snelle sanity checks

Als je snel wilt zien of de app nog logisch werkt:

1. open de app
2. genereer een single person
3. check of profiel, prompt en negative prompt zichtbaar zijn
4. genereer een batch van `100`
5. check of de lijst op één regel per prompt staat
6. check of filters in de linker kolom correct gerespecteerd worden
7. check of full-random batches niet allemaal op elkaar lijken
