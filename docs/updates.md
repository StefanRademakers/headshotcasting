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
