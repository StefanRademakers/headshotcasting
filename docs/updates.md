# Updates

Wijzigingen in volgorde om de variatie te vergroten:

1. `Generate person list` toegevoegd met batchgroottes `100`, `500` en `1000`, zodat grotere sets sneller beoordeeld kunnen worden.
2. `Random global` aangepast naar een neutralere globale mix in plaats van een impliciete regio-pick.
3. Bug opgelost waarbij `eye_color` verkeerd werd gesampled, waardoor bruin te dominant werd.
4. Gebalanceerde batchmodus toegevoegd voor volledig random generaties, zodat kleur- en stijlstreaks minder extreem worden.
5. Batch output genormaliseerd naar promptlijsten van exact één regel per prompt en direct kopieerbaar gemaakt.
6. Apart `hairstyle` veld toegevoegd in plaats van alleen generiek haar op basis van kleur, type en lengte.
7. Haarcatalogus uitgebreid met duidelijkere silhouetten zoals bob, pixie, twists, braids, locs en pulled-back styles.
8. Kapsels gender-/presentation-compatibel gemaakt zodat mannelijke profielen niet meer in duidelijk vrouwelijk gecodeerde kapsels vallen.
9. `hairline` / baldness logica toegevoegd met receding hairlines, thinning crowns en bald states voor realistischere mannelijke variatie.
10. `Random global` batch harder gebalanceerd op haar- en oogkleur om full-random minder familie-achtig te maken.
11. Haar verder verbreed met expliciete long-straight archetypes zoals `long_loose_straight_layers`, `smooth_long_face_framing_layers` en `long_soft_blowout_layers`.
12. Nieuwe haarvelden toegevoegd voor `hair_parting` en `hair_finish` zodat prompts minder vaak op dezelfde haarbeschrijving eindigen.
13. Gendergevoelige hair-length verdelingen toegevoegd, zodat bijvoorbeeld vrouwelijke profielen vaker realistische lange haarlengtes krijgen.
14. Extra gezichtsvariatie toegevoegd via `eyebrow_style`, `facial_hair`, `piercings` en `distinctive_features`.
15. Zichtbare tattoos toegevoegd, met een lage kans in single generation en een genormaliseerde rate van ongeveer `4%` in batch generation.
16. Lichte natuurlijke `facial_asymmetry` toegevoegd zodat gezichten minder perfect gespiegeld voelen.
17. Nieuwe zichtbare variatie-assen toegevoegd: `eyewear`, `jewelry`, `visible_scars` en `cultural_styling`.
18. Subtiele `expression`, `gaze_direction` en `head_pose` variatie toegevoegd om portretten minder statisch te maken.
19. Prompttaal op meerdere plekken aangescherpt zodat een beeldmodel deze variaties ook echt als visuele instructies kan lezen.
20. `Field data` view toegevoegd zodat alle visual/context fields en hun mogelijke waarden inspecteerbaar zijn.
21. `expression` en `facial_asymmetry` losgekoppeld van leeftijd, omdat dit anders kunstmatige patronen introduceert.
22. `jewelry`, `piercings` en `tattoos` minder hard demografisch gestuurd gemaakt.
23. Kinderbrillen mogelijk gemaakt door eyewear compatibility te corrigeren.
24. Extra morphology-assen toegevoegd voor ogen, brows, neus, mond, jukbeenderen, kin, voorhoofd, nek, schouders, facial fullness, visible body build en freckles.
25. `eye_shape` richting explicietere IDs gebracht zoals `almond_eyes`, `round_eyes` en `deep_set_eyes`.
26. Promptbuilder opgesplitst in duidelijkere blokken zoals eye/brow identity, nose/mouth structure, facial structure en visible build.
27. Productrichting aangescherpt: dit prototype moet later kunnen doorgroeien naar een online character database met gekoppelde images, filtering, import via VL extraction, en controlled variant generation.
28. Belangrijke toekomstige architectuur vastgelegd: canonical visual field registry als bron voor generator, `Field data`, VL system prompt, parser/normalizer, filters en prompt output.
29. `VL prompt` tab toegevoegd die een visual-language system prompt dynamisch opbouwt uit de huidige enum data.
30. `Import JSON` tab toegevoegd voor het plakken van extraction JSON, alias-normalisatie en conversie naar een prompt-preview.
31. Import-parser toleranter gemaakt voor VLM edge cases zoals markdown fences, comments, trailing commas, extra tekst rond JSON en afgekapt JSON met ontbrekende closing braces.
32. Import-flow opgesplitst in `Parse JSON` en `Generate prompt`, met handmatige controls voor age, age group, gender presentation, country/origin metadata en region profile voordat de prompt wordt gebouwd.
33. `facial_hair` uitgebreid met fijnmazigere snor-, stubble- en beard-varianten zoals `soft_mustache_with_light_stubble`, `defined_mustache_with_stubble`, `patchy_stubble`, `short_full_beard` en `full_beard`.
34. Compacte `portrait_direction` laag toegevoegd met presence, gaze intensity, mouth/brow expression detail, framing en casting style zodat prompts minder als morphology checklist lezen en meer model presence kunnen sturen.
