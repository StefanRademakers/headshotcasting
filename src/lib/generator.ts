import type { CampaignType, GeneratedPerson, RegionProfileId, RegionVisualProfile, VisualProfile, WeightedMap } from "../types";
import { ageGroups, cheekFullness, culturalStylingProfiles, distinctiveFeatureProfiles, eyebrowStyles, expressionProfiles, eyeShapes, eyewearProfiles, facialAsymmetryProfiles, gazeDirectionWeights, genderPresentations, hairFinishes, hairLengthProfiles, hairLengths, hairPartings, hairlineProfiles, hairstyleProfiles, headPoseWeights, jewelryProfiles, jawShapes, piercingProfiles, professionByCampaign, socioeconomicWeights, tattooProfiles, urbanRuralWeights, visibleScarProfiles } from "../data/options";
import { regionProfiles } from "../data/regions";
import { buildHeadshotPrompt, buildNegativePrompt } from "./promptBuilder";
import { pickFromWeightedMap, pickRandom, pickWeighted, randomInt } from "./random";

export type GenerateOptions = {
  regionProfile?: RegionProfileId | "random";
  ageGroup?: string | "random";
  genderPresentation?: string | "random";
  campaignType?: CampaignType;
};

type GeneratedBatchOptions = GenerateOptions & {
  count: number;
};

type ResolvedGenerateOptions = {
  region: RegionVisualProfile;
  ageGroup: (typeof ageGroups)[number];
  gender: GeneratedPerson["gender_presentation"];
  campaign: CampaignType;
  visualOverrides?: Partial<VisualProfile>;
};

const personalityByCampaign: Record<CampaignType, string[]> = {
  generic_casting: ["natural", "approachable", "believable"],
  healthcare: ["warm", "trustworthy", "calm"],
  education: ["friendly", "patient", "open"],
  public_service: ["trustworthy", "calm", "grounded"],
  banking: ["reliable", "professional", "approachable"],
  tech: ["focused", "modern", "intelligent"],
  fashion: ["bold", "cool", "confident"],
  beauty: ["fresh", "calm", "natural"],
  sports: ["energetic", "confident", "healthy"],
  family: ["warm", "kind", "relatable"],
  luxury: ["composed", "elegant", "understated"],
  local_business: ["friendly", "grounded", "trustworthy"]
};

function mergeUnique(items: string[][]): string[] {
  return Array.from(new Set(items.flat()));
}

function averageWeightedMaps(maps: WeightedMap[]): WeightedMap {
  const keys = new Set(maps.flatMap(map => Object.keys(map)));

  return Object.fromEntries(
    Array.from(keys, key => [
      key,
      maps.reduce((sum, map) => sum + (map[key] ?? 0), 0) / maps.length
    ])
  );
}

function neutralizeWeightedMap(map: WeightedMap, blendWithUniform = 0.5): WeightedMap {
  const keys = Object.keys(map);
  const uniformWeight = 1 / keys.length;

  return Object.fromEntries(
    keys.map(key => [
      key,
      map[key] * blendWithUniform + uniformWeight * (1 - blendWithUniform)
    ])
  );
}

function buildNeutralGlobalProfile(): RegionVisualProfile {
  const neutralMap = (selector: (region: RegionVisualProfile) => WeightedMap) =>
    neutralizeWeightedMap(averageWeightedMaps(regionProfiles.map(selector)));

  return {
    id: "global_neutral",
    label: "Random global",
    countries: mergeUnique(regionProfiles.map(region => region.countries)),
    languages: mergeUnique(regionProfiles.map(region => region.languages)),
    skinToneWeights: neutralMap(region => region.skinToneWeights),
    skinUndertoneWeights: neutralMap(region => region.skinUndertoneWeights),
    hairTypeWeights: neutralMap(region => region.hairTypeWeights),
    hairColorWeights: neutralMap(region => region.hairColorWeights),
    eyeColorWeights: neutralMap(region => region.eyeColorWeights),
    faceShapeWeights: neutralMap(region => region.faceShapeWeights),
    headShapeWeights: neutralMap(region => region.headShapeWeights),
    noseProfileWeights: neutralMap(region => region.noseProfileWeights),
    noseSizeWeights: neutralMap(region => region.noseSizeWeights),
    eyelidTypeWeights: neutralMap(region => region.eyelidTypeWeights),
    lipFullnessWeights: neutralMap(region => region.lipFullnessWeights)
  };
}

const neutralGlobalProfile = buildNeutralGlobalProfile();
const fullyBalancedHairColorWeights = neutralizeWeightedMap(neutralGlobalProfile.hairColorWeights, 0);
const fullyBalancedEyeColorWeights = neutralizeWeightedMap(neutralGlobalProfile.eyeColorWeights, 0);

function shuffleArray<T>(items: T[]): T[] {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function normalizeEyeColor(eyeColor: string): string {
  if (eyeColor === "gray") return "gray_eyes";
  if (eyeColor === "brown") return "brown_eyes";
  return eyeColor;
}

function normalizeNoseSize(noseSize: string): string {
  return noseSize === "medium" ? "medium_size" : noseSize;
}

function isPresentationCompatible(
  compatiblePresentations: Array<GeneratedPerson["gender_presentation"]> | undefined,
  gender: GeneratedPerson["gender_presentation"]
) {
  return !compatiblePresentations || compatiblePresentations.includes(gender);
}

function pickHairstyle(
  hairLength: string,
  hairType: string,
  gender: GeneratedPerson["gender_presentation"]
): (typeof hairstyleProfiles)[number] {
  const compatibleStyles = hairstyleProfiles.filter(style =>
    style.compatibleLengths.includes(hairLength)
    && (!style.compatibleHairTypes || style.compatibleHairTypes.includes(hairType))
    && isPresentationCompatible(style.compatiblePresentations, gender)
  );

  if (compatibleStyles.length === 0) {
    return hairstyleProfiles.find(style => style.id === "shoulder_length_layered_cut") ?? hairstyleProfiles[0];
  }

  return pickWeighted(compatibleStyles);
}

function pickCompatibleHairstyleForPresentation(gender: GeneratedPerson["gender_presentation"]) {
  const compatibleStyles = hairstyleProfiles.filter(style =>
    isPresentationCompatible(style.compatiblePresentations, gender)
  );

  if (compatibleStyles.length === 0) {
    return hairstyleProfiles[0];
  }

  return pickWeighted(compatibleStyles);
}

function pickHairParting(hairstyle: (typeof hairstyleProfiles)[number]): string {
  if (hairstyle.partingVisible === false) {
    return "parting_not_visible";
  }

  if (hairstyle.preferredPartings?.length) {
    return pickWeightedMapValueFromAllowed(hairPartings, hairstyle.preferredPartings);
  }

  return pickFromWeightedMap(hairPartings);
}

function pickHairFinish(hairstyle: (typeof hairstyleProfiles)[number]): string {
  if (hairstyle.preferredFinishes?.length) {
    return pickWeightedMapValueFromAllowed(hairFinishes, hairstyle.preferredFinishes);
  }

  return pickFromWeightedMap(hairFinishes);
}

function pickWeightedMapValueFromAllowed(map: WeightedMap, allowed: string[]): string {
  const filtered = Object.fromEntries(
    Object.entries(map).filter(([key]) => allowed.includes(key))
  );

  if (Object.keys(filtered).length === 0) {
    return allowed[0];
  }

  return pickFromWeightedMap(filtered);
}

function pickDistinctWeightedIds(
  entries: Array<{ id: string; weight: number }>,
  count: number
): string[] {
  const pool = [...entries];
  const picks: string[] = [];

  while (pool.length > 0 && picks.length < count) {
    const selected = pickWeighted(pool);
    picks.push(selected.id);
    const index = pool.findIndex(entry => entry.id === selected.id);
    pool.splice(index, 1);
  }

  return picks;
}

function getFacialHair(ageGroup: string, gender: GeneratedPerson["gender_presentation"]): string {
  if (gender === "female_presenting") return "clean_shaven_face";
  if (gender === "male_presenting") {
    switch (ageGroup) {
      case "young_adult":
        return pickFromWeightedMap({
          clean_shaven_face: 0.46,
          faint_mustache_shadow: 0.08,
          light_stubble: 0.28,
          medium_stubble: 0.10,
          goatee: 0.04,
          trimmed_mustache: 0.04
        });
      case "adult":
        return pickFromWeightedMap({
          clean_shaven_face: 0.30,
          light_stubble: 0.26,
          medium_stubble: 0.18,
          short_boxed_beard: 0.12,
          goatee: 0.05,
          trimmed_mustache: 0.05,
          mustache_with_stubble: 0.04
        });
      case "middle_aged":
        return pickFromWeightedMap({
          clean_shaven_face: 0.24,
          light_stubble: 0.20,
          medium_stubble: 0.18,
          short_boxed_beard: 0.14,
          goatee: 0.07,
          trimmed_mustache: 0.07,
          mustache_with_stubble: 0.05,
          salt_and_pepper_beard: 0.05
        });
      case "senior":
      case "elderly":
        return pickFromWeightedMap({
          clean_shaven_face: 0.28,
          light_stubble: 0.16,
          medium_stubble: 0.12,
          short_boxed_beard: 0.12,
          trimmed_mustache: 0.10,
          mustache_with_stubble: 0.08,
          salt_and_pepper_beard: 0.14
        });
      default:
        return "clean_shaven_face";
    }
  }

  return pickFromWeightedMap({
    clean_shaven_face: 0.74,
    light_stubble: 0.10,
    medium_stubble: 0.06,
    faint_mustache_shadow: 0.04,
    trimmed_mustache: 0.03,
    goatee: 0.03
  });
}

function getPiercings(ageGroup: string, gender: GeneratedPerson["gender_presentation"]): string[] {
  if (ageGroup === "child") return [];

  const compatible = piercingProfiles.filter(profile =>
    isPresentationCompatible(profile.compatiblePresentations, gender)
  );

  const count = ageGroup === "teen"
    ? randomInt(0, 2)
    : randomInt(0, 2);

  if (count === 0 || compatible.length === 0) {
    return [];
  }

  return pickDistinctWeightedIds(
    compatible.map(profile => ({ id: profile.id, weight: profile.weight })),
    count
  );
}

function getDistinctiveFeatures(ageGroup: string): string[] {
  const count = ageGroup === "child" ? randomInt(0, 1) : randomInt(0, 2);

  if (count === 0) {
    return [];
  }

  return pickDistinctWeightedIds(distinctiveFeatureProfiles, count);
}

function getTattoos(ageGroup: string, gender: GeneratedPerson["gender_presentation"]): string[] {
  if (ageGroup === "child") return [];

  const compatible = tattooProfiles.filter(profile =>
    isPresentationCompatible(profile.compatiblePresentations, gender)
  );

  if (compatible.length === 0) {
    return [];
  }

  return Math.random() < 0.04
    ? pickDistinctWeightedIds(
      compatible.map(profile => ({ id: profile.id, weight: profile.weight })),
      1
    )
    : [];
}

function getEyewear(ageGroup: string): string {
  const compatible = eyewearProfiles.filter(profile =>
    !profile.compatibleAges || profile.compatibleAges.includes(ageGroup as AgeGroup)
  );

  return pickWeighted(compatible).id;
}

function getJewelry(gender: GeneratedPerson["gender_presentation"]): string[] {
  const compatible = jewelryProfiles.filter(profile =>
    isPresentationCompatible(profile.compatiblePresentations, gender)
  );
  const pick = pickWeighted(compatible).id;

  return pick === "no_visible_jewelry" ? [] : [pick];
}

function getVisibleScars(): string[] {
  const pick = pickWeighted(visibleScarProfiles).id;
  return pick === "no_visible_scars" ? [] : [pick];
}

function getCulturalStyling(
  regionId: RegionProfileId,
  gender: GeneratedPerson["gender_presentation"]
): string[] {
  const compatible = culturalStylingProfiles.filter(profile =>
    (!profile.compatibleRegions || profile.compatibleRegions.includes(regionId))
    && isPresentationCompatible(profile.compatiblePresentations, gender)
  );
  const pick = pickWeighted(compatible).id;

  return pick === "no_specific_cultural_styling" ? [] : [pick];
}

function getHairlineWeights(ageGroup: string, gender: GeneratedPerson["gender_presentation"]): WeightedMap {
  if (ageGroup === "child") return hairlineProfiles.child;
  if (ageGroup === "teen") return hairlineProfiles.teen;
  const malePresenting = gender === "male_presenting";

  switch (ageGroup) {
    case "young_adult":
      return malePresenting ? hairlineProfiles.young_adult_male : hairlineProfiles.young_adult_default;
    case "adult":
      return malePresenting ? hairlineProfiles.adult_male : hairlineProfiles.adult_default;
    case "middle_aged":
      return malePresenting ? hairlineProfiles.middle_aged_male : hairlineProfiles.middle_aged_default;
    case "senior":
      return malePresenting ? hairlineProfiles.senior_male : hairlineProfiles.senior_default;
    default:
      return malePresenting ? hairlineProfiles.elderly_male : hairlineProfiles.elderly_default;
  }
}

function getHairline(ageGroup: string, gender: GeneratedPerson["gender_presentation"]): string {
  return pickFromWeightedMap(getHairlineWeights(ageGroup, gender));
}

function getCompatibleHairline(
  hairstyleId: string,
  ageGroup: string,
  gender: GeneratedPerson["gender_presentation"]
): string {
  if (hairstyleId === "clean_shaved_head") {
    return "clean_shaved_bald";
  }

  const allowedHairlines = hairstyleId === "buzz_cut_fade"
    ? ["full_hairline", "mature_hairline", "slightly_receding_hairline", "receding_hairline", "closely_shaved_balding"]
    : ["full_hairline", "mature_hairline", "slightly_receding_hairline", "receding_hairline"];

  return pickWeightedMapValueFromAllowed(getHairlineWeights(ageGroup, gender), allowedHairlines);
}

function getHairLengthWeights(gender: GeneratedPerson["gender_presentation"]): WeightedMap {
  return hairLengthProfiles[gender] ?? hairLengths;
}

function pickHairLength(
  gender: GeneratedPerson["gender_presentation"],
  allowedLengths: string[]
): string {
  return pickWeightedMapValueFromAllowed(getHairLengthWeights(gender), allowedLengths);
}

function resolveHairPresentation(
  region: ReturnType<typeof getRegion>,
  ageGroup: string,
  gender: GeneratedPerson["gender_presentation"]
) {
  const hairline = getHairline(ageGroup, gender);
  const hairColor = pickFromWeightedMap(region.hairColorWeights);
  const hairType = pickFromWeightedMap(region.hairTypeWeights);
  const eyebrowStyle = pickFromWeightedMap(eyebrowStyles);
  const facialHair = getFacialHair(ageGroup, gender);
  const eyewear = getEyewear(ageGroup);
  const jewelry = getJewelry(gender);
  const piercings = getPiercings(ageGroup, gender);
  const tattoos = getTattoos(ageGroup, gender);
  const visibleScars = getVisibleScars();
  const culturalStyling = getCulturalStyling(region.id, gender);
  const distinctiveFeatures = getDistinctiveFeatures(ageGroup);

  if (hairline === "clean_shaved_bald") {
    return {
      eyebrow_style: eyebrowStyle,
      hair_color: hairColor,
      hair_type: hairType,
      hair_length: "shaved",
      hairstyle: "clean_shaved_head",
      hairstyle_presentation: "masculine_coded",
      hair_parting: "parting_not_visible",
      hair_finish: "finish_not_emphasized",
      hairline,
      facial_hair: facialHair,
      eyewear,
      piercings,
      jewelry,
      tattoos,
      visible_scars: visibleScars,
      cultural_styling: culturalStyling,
      distinctive_features: distinctiveFeatures
    };
  }

  if (hairline === "closely_shaved_balding") {
    return {
      eyebrow_style: eyebrowStyle,
      hair_color: hairColor,
      hair_type: hairType,
      hair_length: "buzz_cut",
      hairstyle: "buzz_cut_fade",
      hairstyle_presentation: "masculine_coded",
      hair_parting: "parting_not_visible",
      hair_finish: "smooth_polished_finish",
      hairline,
      facial_hair: facialHair,
      eyewear,
      piercings,
      jewelry,
      tattoos,
      visible_scars: visibleScars,
      cultural_styling: culturalStyling,
      distinctive_features: distinctiveFeatures
    };
  }

  const constrainedLengths = hairline === "balding_top"
    ? ["buzz_cut", "short"]
    : hairline === "thinning_crown" || hairline === "receding_hairline"
      ? ["buzz_cut", "short", "medium"]
      : Object.keys(hairLengths);

  const hairLength = pickHairLength(gender, constrainedLengths);
  const hairstyle = pickHairstyle(hairLength, hairType, gender);

  return {
    eyebrow_style: eyebrowStyle,
    hair_color: hairColor,
    hair_type: hairType,
    hair_length: hairLength,
    hairstyle: hairstyle.id,
    hairstyle_presentation: hairstyle.presentationCoding,
    hair_parting: pickHairParting(hairstyle),
    hair_finish: pickHairFinish(hairstyle),
    hairline,
    facial_hair: facialHair,
    eyewear,
    piercings,
    jewelry,
    tattoos,
    visible_scars: visibleScars,
    cultural_styling: culturalStyling,
    distinctive_features: distinctiveFeatures
  };
}

function buildWeightedDeck(entries: Array<{ id: string; weight: number }>, count: number): string[] {
  const rawCounts = entries.map(entry => ({ ...entry, rawCount: entry.weight * count }));
  const baseCounts = rawCounts.map(entry => ({ ...entry, count: Math.floor(entry.rawCount), remainder: entry.rawCount - Math.floor(entry.rawCount) }));
  let assigned = baseCounts.reduce((sum, entry) => sum + entry.count, 0);

  for (const entry of [...baseCounts].sort((left, right) => right.remainder - left.remainder)) {
    if (assigned >= count) break;
    entry.count += 1;
    assigned += 1;
  }

  const deck = baseCounts.flatMap(entry => Array.from({ length: entry.count }, () => entry.id));

  if (deck.length < count) {
    const fallback = pickWeighted(entries).id;
    deck.push(...Array.from({ length: count - deck.length }, () => fallback));
  }

  return shuffleArray(deck.slice(0, count));
}

function buildWeightedMapDeck(map: WeightedMap, count: number): string[] {
  return buildWeightedDeck(Object.entries(map).map(([id, weight]) => ({ id, weight })), count);
}

function applyBatchTattooRate(persons: GeneratedPerson[]): GeneratedPerson[] {
  const eligibleIndexes = persons
    .map((person, index) => ({ person, index }))
    .filter(({ person }) => person.age_group !== "child");

  if (eligibleIndexes.length === 0) {
    return persons;
  }

  const targetTattooCount = Math.min(
    eligibleIndexes.length,
    Math.round(eligibleIndexes.length * 0.04)
  );

  const tattooDeck = shuffleArray(
    eligibleIndexes.map(({ person, index }) => ({
      index,
      tattoo: pickDistinctWeightedIds(
        tattooProfiles
          .filter(profile => isPresentationCompatible(profile.compatiblePresentations, person.gender_presentation))
          .map(profile => ({ id: profile.id, weight: profile.weight })),
        1
      )
    }))
  );

  const tattooIndexes = new Set(tattooDeck.slice(0, targetTattooCount).map(entry => entry.index));

  return persons.map((person, index) => {
    const tattoos = tattooIndexes.has(index)
      ? tattooDeck.find(entry => entry.index === index)?.tattoo ?? []
      : [];

    const nextPerson = {
      ...person,
      visual: {
        ...person.visual,
        tattoos
      }
    };

    return {
      ...nextPerson,
      prompt_description: buildHeadshotPrompt(nextPerson)
    };
  });
}

function isFullyRandom(options: GenerateOptions): boolean {
  return (!options.regionProfile || options.regionProfile === "random")
    && (!options.ageGroup || options.ageGroup === "random")
    && (!options.genderPresentation || options.genderPresentation === "random");
}

function getAgeProfile(ageGroupId: string | undefined) {
  if (!ageGroupId || ageGroupId === "random") return pickWeighted(ageGroups);
  return ageGroups.find(group => group.id === ageGroupId) ?? pickWeighted(ageGroups);
}

function getGender(genderId: string | undefined) {
  if (!genderId || genderId === "random") return pickWeighted(genderPresentations).id;
  return genderId as GeneratedPerson["gender_presentation"];
}

function getRegion(regionId: RegionProfileId | "random" | undefined) {
  if (!regionId || regionId === "random") return neutralGlobalProfile;
  return regionProfiles.find(region => region.id === regionId) ?? pickRandom(regionProfiles);
}

function agingForAge(ageGroup: string) {
  switch (ageGroup) {
    case "child":
      return {
        wrinkle_level: pickFromWeightedMap({ none: 0.92, very_subtle: 0.08 }),
        crow_feet: pickFromWeightedMap({ none: 0.96, very_subtle: 0.04 }),
        nasolabial_folds: pickFromWeightedMap({ none: 0.90, very_subtle: 0.10 }),
        pore_visibility: pickFromWeightedMap({ smooth: 0.48, natural_pores: 0.40, fine_texture: 0.12 })
      };
    case "teen":
    case "young_adult":
      return {
        wrinkle_level: pickFromWeightedMap({ none: 0.45, very_subtle: 0.40, subtle: 0.15 }),
        crow_feet: pickFromWeightedMap({ none: 0.55, very_subtle: 0.35, subtle: 0.10 }),
        nasolabial_folds: pickFromWeightedMap({ none: 0.35, very_subtle: 0.45, subtle: 0.20 }),
        pore_visibility: pickFromWeightedMap({ natural_pores: 0.50, visible_pores: 0.20, fine_texture: 0.20, smooth: 0.10 })
      };
    case "adult":
      return {
        wrinkle_level: pickFromWeightedMap({ very_subtle: 0.24, subtle: 0.48, moderate: 0.24, pronounced: 0.04 }),
        crow_feet: pickFromWeightedMap({ very_subtle: 0.30, subtle: 0.42, moderate: 0.24, pronounced: 0.04 }),
        nasolabial_folds: pickFromWeightedMap({ very_subtle: 0.16, subtle: 0.46, moderate: 0.32, pronounced: 0.06 }),
        pore_visibility: pickFromWeightedMap({ natural_pores: 0.46, visible_pores: 0.27, fine_texture: 0.17, uneven_texture: 0.10 })
      };
    case "middle_aged":
      return {
        wrinkle_level: pickFromWeightedMap({ subtle: 0.20, moderate: 0.48, pronounced: 0.26, deep: 0.06 }),
        crow_feet: pickFromWeightedMap({ subtle: 0.18, moderate: 0.48, pronounced: 0.28, deep: 0.06 }),
        nasolabial_folds: pickFromWeightedMap({ subtle: 0.12, moderate: 0.50, pronounced: 0.30, deep: 0.08 }),
        pore_visibility: pickFromWeightedMap({ natural_pores: 0.30, visible_pores: 0.32, mature_skin_texture: 0.20, sun_damaged_texture: 0.12, uneven_texture: 0.06 })
      };
    default:
      return {
        wrinkle_level: pickFromWeightedMap({ moderate: 0.24, pronounced: 0.48, deep: 0.28 }),
        crow_feet: pickFromWeightedMap({ moderate: 0.22, pronounced: 0.48, deep: 0.30 }),
        nasolabial_folds: pickFromWeightedMap({ moderate: 0.22, pronounced: 0.50, deep: 0.28 }),
        pore_visibility: pickFromWeightedMap({ mature_skin_texture: 0.44, sun_damaged_texture: 0.24, visible_pores: 0.20, uneven_texture: 0.12 })
      };
  }
}

function getFacialAsymmetry(ageGroup: string): string {
  return pickFromWeightedMap(
    facialAsymmetryProfiles[ageGroup as keyof typeof facialAsymmetryProfiles]
      ?? facialAsymmetryProfiles.adult
  );
}

function getExpression(ageGroup: string): string {
  return pickFromWeightedMap(
    expressionProfiles[ageGroup as keyof typeof expressionProfiles]
      ?? expressionProfiles.adult
  );
}

function generateVisual(
  region: ReturnType<typeof getRegion>,
  ageGroup: string,
  gender: GeneratedPerson["gender_presentation"],
  overrides: Partial<VisualProfile> = {}
): VisualProfile {
  const aging = agingForAge(ageGroup);
  const eyeColor = pickFromWeightedMap(region.eyeColorWeights);
  const eyeShape = pickFromWeightedMap(eyeShapes);
  const noseSize = pickFromWeightedMap(region.noseSizeWeights);
  const hairPresentation = resolveHairPresentation(region, ageGroup, gender);

  return {
    face_shape: pickFromWeightedMap(region.faceShapeWeights),
    head_shape: pickFromWeightedMap(region.headShapeWeights),
    skin_tone: pickFromWeightedMap(region.skinToneWeights),
    skin_undertone: pickFromWeightedMap(region.skinUndertoneWeights),
    skin_texture: aging.pore_visibility,
    eyebrow_style: hairPresentation.eyebrow_style,
    hair_color: hairPresentation.hair_color,
    hair_type: hairPresentation.hair_type,
    hair_length: hairPresentation.hair_length,
    hairstyle: hairPresentation.hairstyle,
    hairstyle_presentation: hairPresentation.hairstyle_presentation,
    hair_parting: hairPresentation.hair_parting,
    hair_finish: hairPresentation.hair_finish,
    hairline: hairPresentation.hairline,
    facial_hair: hairPresentation.facial_hair,
    eyewear: hairPresentation.eyewear,
    piercings: hairPresentation.piercings,
    jewelry: hairPresentation.jewelry,
    tattoos: hairPresentation.tattoos,
    visible_scars: hairPresentation.visible_scars,
    cultural_styling: hairPresentation.cultural_styling,
    distinctive_features: hairPresentation.distinctive_features,
    eye_color: normalizeEyeColor(eyeColor),
    eye_shape: eyeShape === "round" ? "round_eyes" : eyeShape,
    facial_asymmetry: getFacialAsymmetry(ageGroup),
    expression: getExpression(ageGroup),
    gaze_direction: pickFromWeightedMap(gazeDirectionWeights),
    head_pose: pickFromWeightedMap(headPoseWeights),
    eyelid_type: pickFromWeightedMap(region.eyelidTypeWeights),
    nose_size: normalizeNoseSize(noseSize),
    nose_profile: pickFromWeightedMap(region.noseProfileWeights),
    lip_fullness: pickFromWeightedMap(region.lipFullnessWeights),
    cheek_fullness: pickFromWeightedMap(cheekFullness),
    jaw_shape: pickFromWeightedMap(jawShapes),
    wrinkle_level: aging.wrinkle_level,
    crow_feet: aging.crow_feet,
    nasolabial_folds: aging.nasolabial_folds,
    pore_visibility: aging.pore_visibility,
    ...overrides
  };
}

function makeCode(country: string, age: number, gender: string): string {
  const countryCode = country.slice(0, 2).toUpperCase();
  const genderCode = gender.startsWith("female") ? "F" : gender.startsWith("male") ? "M" : "X";
  return `${countryCode}_${genderCode}_${age}_${Math.floor(Math.random() * 9000 + 1000)}`;
}

function buildPerson(options: ResolvedGenerateOptions): GeneratedPerson {
  const age = randomInt(options.ageGroup.minAge, options.ageGroup.maxAge);
  const country = pickRandom(options.region.countries);
  const visual = generateVisual(options.region, options.ageGroup.id, options.gender, options.visualOverrides);
  const socioeconomic = pickFromWeightedMap(socioeconomicWeights);
  const profession = pickRandom(professionByCampaign[options.campaign]);

  const personWithoutPrompts = {
    id: crypto.randomUUID(),
    display_name: `Model ${makeCode(country, age, options.gender)}`,
    model_code: makeCode(country, age, options.gender),
    active: true,

    age,
    age_group: options.ageGroup.id,
    gender_presentation: options.gender,

    region_profile: options.region.id,
    region_label: options.region.label,
    country_of_origin: country,
    current_region: options.region.label,
    cultural_background: `${country} / ${options.region.label}`,
    languages: [pickRandom(options.region.languages), "English"].filter((v, i, arr) => arr.indexOf(v) === i),

    socioeconomic_context: socioeconomic,
    urban_rural_context: pickFromWeightedMap(urbanRuralWeights),
    profession_category: profession,
    lifestyle_segment: `${socioeconomic.replaceAll("_", " ")} ${options.campaign.replaceAll("_", " ")}`,

    visual,

    casting: {
      campaign_type: options.campaign,
      personality_vibe: personalityByCampaign[options.campaign],
      suitable_campaign_types: [options.campaign, "generic_casting"] as CampaignType[]
    },

    prompt_description: "",
    negative_prompt: ""
  } satisfies GeneratedPerson;

  return {
    ...personWithoutPrompts,
    prompt_description: buildHeadshotPrompt(personWithoutPrompts),
    negative_prompt: buildNegativePrompt()
  };
}

export function generatePerson(options: GenerateOptions = {}): GeneratedPerson {
  const region = getRegion(options.regionProfile);
  const ageGroup = getAgeProfile(options.ageGroup);
  const gender = getGender(options.genderPresentation);
  const campaign = options.campaignType ?? "generic_casting";

  return buildPerson({
    region,
    ageGroup,
    gender,
    campaign
  });
}

export function generatePersonBatch(options: GeneratedBatchOptions): GeneratedPerson[] {
  const campaign = options.campaignType ?? "generic_casting";

  if (!isFullyRandom(options)) {
    return applyBatchTattooRate(Array.from({ length: options.count }, () => generatePerson(options)));
  }

  const ageDeck = buildWeightedDeck(ageGroups.map(group => ({ id: group.id, weight: group.weight })), options.count);
  const genderDeck = buildWeightedDeck(genderPresentations.map(group => ({ id: group.id, weight: group.weight })), options.count);
  const hairDeck = buildWeightedMapDeck(fullyBalancedHairColorWeights, options.count);
  const eyeDeck = buildWeightedMapDeck(fullyBalancedEyeColorWeights, options.count).map(normalizeEyeColor);
  const hairstyleDeck = buildWeightedDeck(
    hairstyleProfiles.map(style => ({ id: style.id, weight: style.weight })),
    options.count
  );

  const persons = Array.from({ length: options.count }, (_, index) => {
    const ageGroup = getAgeProfile(ageDeck[index]);
    const gender = getGender(genderDeck[index]);
    const compatibleStyles = hairstyleProfiles.filter(style =>
      isPresentationCompatible(style.compatiblePresentations, gender)
    );
    const requestedHairstyleId = hairstyleDeck[index];
    const hairstyle = compatibleStyles.find(style => style.id === requestedHairstyleId)
      ?? pickCompatibleHairstyleForPresentation(gender)
      ?? compatibleStyles[0]
      ?? hairstyleProfiles[0];
    const hairLength = pickHairLength(gender, hairstyle.compatibleLengths);
    const hairType = hairstyle.compatibleHairTypes
      ? pickWeightedMapValueFromAllowed(neutralGlobalProfile.hairTypeWeights, hairstyle.compatibleHairTypes)
      : pickFromWeightedMap(neutralGlobalProfile.hairTypeWeights);
    const hairline = getCompatibleHairline(hairstyle.id, ageGroup.id, gender);

    return buildPerson({
      region: neutralGlobalProfile,
      ageGroup,
      gender,
      campaign,
      visualOverrides: {
        hair_color: hairDeck[index],
        hair_type: hairType,
        hair_length: hairLength,
        hairstyle: hairstyle.id,
        hairstyle_presentation: hairstyle.presentationCoding,
        hair_parting: pickHairParting(hairstyle),
        hair_finish: pickHairFinish(hairstyle),
        hairline,
        eye_color: eyeDeck[index]
      }
    });
  });

  return applyBatchTattooRate(persons);
}
