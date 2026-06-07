import { useMemo, useState } from "react";
import * as optionData from "./data/options";
import { campaignTypes } from "./data/options";
import { regionProfiles } from "./data/regions";
import { generatePerson, generatePersonBatch } from "./lib/generator";
import { buildHeadshotPrompt } from "./lib/promptBuilder";
import type { AgeGroup, CampaignType, GeneratedPerson, GenderPresentation, RegionProfileId, VisualProfile } from "./types";

const ageOptions: Array<{ id: AgeGroup | "random"; label: string }> = [
  { id: "random", label: "Random" },
  { id: "child", label: "Child" },
  { id: "teen", label: "Teen" },
  { id: "young_adult", label: "Young adult" },
  { id: "adult", label: "Adult" },
  { id: "middle_aged", label: "Middle aged" },
  { id: "senior", label: "Senior" },
  { id: "elderly", label: "Elderly" }
];

const genderOptions: Array<{ id: GenderPresentation | "random"; label: string }> = [
  { id: "random", label: "Random" },
  { id: "female_presenting", label: "Female presenting" },
  { id: "male_presenting", label: "Male presenting" },
  { id: "androgynous", label: "Androgynous" },
  { id: "non_binary_presenting", label: "Non-binary presenting" }
];

const batchCountOptions = [100, 500, 1000] as const;

type DataField = {
  field: string;
  values: string[];
  source?: string;
};

type DataGroup = {
  title: string;
  fields: DataField[];
};

type ImportedField = {
  value: unknown;
  confidence?: number;
};

type ImportedExtraction = Record<string, unknown>;

type ImportResult = {
  prompt: string;
  normalizedPerson: GeneratedPerson;
  appliedFields: string[];
  ignoredFields: string[];
  warnings: string[];
};

type ImportDraft = {
  normalizedPerson: GeneratedPerson;
  appliedFields: string[];
  ignoredFields: string[];
  warnings: string[];
};

const unique = (values: string[]) => Array.from(new Set(values)).sort();
const mapKeys = (map: Record<string, number>) => Object.keys(map);
const profileIds = (profiles: Array<{ id: string }>) => profiles.map(profile => profile.id);
const nestedMapKeys = (maps: Record<string, Record<string, number>>) =>
  unique(Object.values(maps).flatMap(map => Object.keys(map)));
const regionMapKeys = (selector: (region: (typeof regionProfiles)[number]) => Record<string, number>) =>
  unique(regionProfiles.flatMap(region => Object.keys(selector(region))));

const agingTextureValues = [
  "none",
  "very_subtle",
  "subtle",
  "moderate",
  "pronounced",
  "deep",
  "smooth",
  "natural_pores",
  "fine_texture",
  "visible_pores",
  "uneven_texture",
  "mature_skin_texture",
  "sun_damaged_texture"
];

const facialHairValues = [
  "clean_shaven_face",
  "faint_mustache_shadow",
  "soft_natural_mustache",
  "thin_mustache",
  "defined_mustache",
  "chevron_mustache",
  "light_stubble",
  "medium_stubble",
  "heavy_stubble",
  "patchy_stubble",
  "jawline_stubble",
  "chin_stubble",
  "faint_mustache_with_light_stubble",
  "soft_mustache_with_light_stubble",
  "defined_mustache_with_stubble",
  "mustache_with_medium_stubble",
  "soul_patch",
  "goatee",
  "trimmed_mustache",
  "short_boxed_beard",
  "short_full_beard",
  "scruffy_short_beard",
  "full_beard",
  "mustache_with_stubble",
  "salt_and_pepper_beard"
];

const dataGroups: DataGroup[] = [
  {
    title: "Identity and casting",
    fields: [
      { field: "region_profile", values: regionProfiles.map(region => region.id), source: "regionProfiles.id" },
      { field: "country_of_origin", values: unique(regionProfiles.flatMap(region => region.countries)), source: "regionProfiles.countries" },
      { field: "languages", values: unique(regionProfiles.flatMap(region => region.languages)), source: "regionProfiles.languages" },
      { field: "age_group", values: optionData.ageGroups.map(group => group.id), source: "ageGroups.id" },
      { field: "gender_presentation", values: optionData.genderPresentations.map(group => group.id), source: "genderPresentations.id" },
      { field: "campaign_type", values: optionData.campaignTypes.map(type => type.id), source: "campaignTypes.id" },
      { field: "socioeconomic_context", values: mapKeys(optionData.socioeconomicWeights), source: "socioeconomicWeights" },
      { field: "urban_rural_context", values: mapKeys(optionData.urbanRuralWeights), source: "urbanRuralWeights" },
      { field: "profession_category", values: unique(Object.values(optionData.professionByCampaign).flat()), source: "professionByCampaign" }
    ]
  },
  {
    title: "Visual morphology",
    fields: [
      { field: "face_shape", values: regionMapKeys(region => region.faceShapeWeights), source: "regionProfiles.*.faceShapeWeights" },
      { field: "head_shape", values: regionMapKeys(region => region.headShapeWeights), source: "regionProfiles.*.headShapeWeights" },
      { field: "skin_tone", values: regionMapKeys(region => region.skinToneWeights), source: "regionProfiles.*.skinToneWeights" },
      { field: "skin_undertone", values: regionMapKeys(region => region.skinUndertoneWeights), source: "regionProfiles.*.skinUndertoneWeights" },
      { field: "eye_color", values: regionMapKeys(region => region.eyeColorWeights), source: "regionProfiles.*.eyeColorWeights" },
      { field: "eye_shape", values: mapKeys(optionData.eyeShapes), source: "eyeShapes" },
      { field: "eye_size", values: mapKeys(optionData.eyeSizes), source: "eyeSizes" },
      { field: "eye_spacing", values: mapKeys(optionData.eyeSpacing), source: "eyeSpacing" },
      { field: "canthal_tilt", values: mapKeys(optionData.canthalTilts), source: "canthalTilts" },
      { field: "under_eye_detail", values: mapKeys(optionData.underEyeDetails), source: "underEyeDetails" },
      { field: "eyelid_type", values: regionMapKeys(region => region.eyelidTypeWeights), source: "regionProfiles.*.eyelidTypeWeights" },
      { field: "eyebrow_style", values: mapKeys(optionData.eyebrowStyles), source: "eyebrowStyles" },
      { field: "eyebrow_density", values: mapKeys(optionData.eyebrowDensity), source: "eyebrowDensity" },
      { field: "eyebrow_position", values: mapKeys(optionData.eyebrowPosition), source: "eyebrowPosition" },
      { field: "brow_ridge_prominence", values: mapKeys(optionData.browRidgeProminence), source: "browRidgeProminence" },
      { field: "nose_size", values: unique([...regionMapKeys(region => region.noseSizeWeights), "medium_size"]), source: "regionProfiles.*.noseSizeWeights" },
      { field: "nose_profile", values: regionMapKeys(region => region.noseProfileWeights), source: "regionProfiles.*.noseProfileWeights" },
      { field: "nose_length", values: mapKeys(optionData.noseLengths), source: "noseLengths" },
      { field: "nose_bridge_width", values: mapKeys(optionData.noseBridgeWidths), source: "noseBridgeWidths" },
      { field: "nose_tip_shape", values: mapKeys(optionData.noseTipShapes), source: "noseTipShapes" },
      { field: "nostril_width", values: mapKeys(optionData.nostrilWidths), source: "nostrilWidths" },
      { field: "nostril_visibility", values: mapKeys(optionData.nostrilVisibility), source: "nostrilVisibility" },
      { field: "lip_fullness", values: regionMapKeys(region => region.lipFullnessWeights), source: "regionProfiles.*.lipFullnessWeights" },
      { field: "mouth_width", values: mapKeys(optionData.mouthWidths), source: "mouthWidths" },
      { field: "mouth_shape", values: mapKeys(optionData.mouthShapes), source: "mouthShapes" },
      { field: "cupid_bow_definition", values: mapKeys(optionData.cupidBowDefinition), source: "cupidBowDefinition" },
      { field: "philtrum_length", values: mapKeys(optionData.philtrumLengths), source: "philtrumLengths" },
      { field: "facial_fullness", values: mapKeys(optionData.facialFullness), source: "facialFullness" },
      { field: "visible_body_build", values: mapKeys(optionData.visibleBodyBuild), source: "visibleBodyBuild" },
      { field: "cheek_fullness", values: mapKeys(optionData.cheekFullness), source: "cheekFullness" },
      { field: "cheekbone_height", values: mapKeys(optionData.cheekboneHeights), source: "cheekboneHeights" },
      { field: "cheekbone_prominence", values: mapKeys(optionData.cheekboneProminence), source: "cheekboneProminence" },
      { field: "jaw_shape", values: mapKeys(optionData.jawShapes), source: "jawShapes" },
      { field: "chin_shape", values: mapKeys(optionData.chinShapes), source: "chinShapes" },
      { field: "forehead_height", values: mapKeys(optionData.foreheadHeights), source: "foreheadHeights" },
      { field: "neck_width", values: mapKeys(optionData.neckWidths), source: "neckWidths" },
      { field: "shoulder_frame", values: mapKeys(optionData.shoulderFrames), source: "shoulderFrames" },
      { field: "freckle_pattern", values: mapKeys(optionData.frecklePatterns), source: "frecklePatterns" },
      { field: "facial_asymmetry", values: mapKeys(optionData.facialAsymmetryWeights), source: "facialAsymmetryWeights" }
    ]
  },
  {
    title: "Hair and grooming",
    fields: [
      { field: "hair_color", values: regionMapKeys(region => region.hairColorWeights), source: "regionProfiles.*.hairColorWeights" },
      { field: "hair_type", values: regionMapKeys(region => region.hairTypeWeights), source: "regionProfiles.*.hairTypeWeights" },
      { field: "hair_length", values: mapKeys(optionData.hairLengths), source: "hairLengths / hairLengthProfiles" },
      { field: "hairstyle", values: profileIds(optionData.hairstyleProfiles), source: "hairstyleProfiles.id" },
      { field: "hairstyle_presentation", values: unique(optionData.hairstyleProfiles.map(style => style.presentationCoding)), source: "hairstyleProfiles.presentationCoding" },
      { field: "hair_parting", values: [...mapKeys(optionData.hairPartings), "parting_not_visible"], source: "hairPartings" },
      { field: "hair_finish", values: mapKeys(optionData.hairFinishes), source: "hairFinishes" },
      { field: "hairline", values: nestedMapKeys(optionData.hairlineProfiles), source: "hairlineProfiles" },
      { field: "facial_hair", values: facialHairValues, source: "generator facial-hair maps" }
    ]
  },
  {
    title: "Visible details and styling",
    fields: [
      { field: "eyewear", values: profileIds(optionData.eyewearProfiles), source: "eyewearProfiles.id" },
      { field: "piercings", values: profileIds(optionData.piercingProfiles), source: "piercingProfiles.id" },
      { field: "jewelry", values: profileIds(optionData.jewelryProfiles), source: "jewelryProfiles.id" },
      { field: "tattoos", values: profileIds(optionData.tattooProfiles), source: "tattooProfiles.id" },
      { field: "visible_scars", values: profileIds(optionData.visibleScarProfiles), source: "visibleScarProfiles.id" },
      { field: "cultural_styling", values: profileIds(optionData.culturalStylingProfiles), source: "culturalStylingProfiles.id" },
      { field: "distinctive_features", values: profileIds(optionData.distinctiveFeatureProfiles), source: "distinctiveFeatureProfiles.id" }
    ]
  },
  {
    title: "Aging, expression and pose",
    fields: [
      { field: "skin_texture", values: agingTextureValues, source: "generator aging maps" },
      { field: "wrinkle_level", values: ["none", "very_subtle", "subtle", "moderate", "pronounced", "deep"], source: "generator aging maps" },
      { field: "crow_feet", values: ["none", "very_subtle", "subtle", "moderate", "pronounced", "deep"], source: "generator aging maps" },
      { field: "nasolabial_folds", values: ["none", "very_subtle", "subtle", "moderate", "pronounced", "deep"], source: "generator aging maps" },
      { field: "pore_visibility", values: ["smooth", "natural_pores", "fine_texture", "visible_pores", "uneven_texture", "mature_skin_texture", "sun_damaged_texture"], source: "generator aging maps" },
      { field: "expression", values: mapKeys(optionData.expressionWeights), source: "expressionWeights" },
      { field: "presence_vibe", values: mapKeys(optionData.presenceVibes), source: "presenceVibes" },
      { field: "gaze_intensity", values: mapKeys(optionData.gazeIntensity), source: "gazeIntensity" },
      { field: "mouth_expression_detail", values: mapKeys(optionData.mouthExpressionDetails), source: "mouthExpressionDetails" },
      { field: "brow_expression_detail", values: mapKeys(optionData.browExpressionDetails), source: "browExpressionDetails" },
      { field: "portrait_framing", values: mapKeys(optionData.portraitFraming), source: "portraitFraming" },
      { field: "casting_style", values: mapKeys(optionData.castingStyles), source: "castingStyles" },
      { field: "gaze_direction", values: mapKeys(optionData.gazeDirectionWeights), source: "gazeDirectionWeights" },
      { field: "head_pose", values: mapKeys(optionData.headPoseWeights), source: "headPoseWeights" }
    ]
  }
];

const allFieldDataText = dataGroups
  .flatMap(group => group.fields.map(field => `${field.field}: [${field.values.join(", ")}]`))
  .join("\n");

const allowedValuesByField = new Map(
  dataGroups
    .flatMap(group => group.fields)
    .map(field => [field.field, new Set(field.values)])
);

const visualFieldNames = new Set([
  "face_shape",
  "head_shape",
  "skin_tone",
  "skin_undertone",
  "skin_texture",
  "eyebrow_style",
  "hair_color",
  "hair_type",
  "hair_length",
  "hairstyle",
  "hairstyle_presentation",
  "hair_parting",
  "hair_finish",
  "hairline",
  "facial_hair",
  "eyewear",
  "piercings",
  "jewelry",
  "tattoos",
  "visible_scars",
  "cultural_styling",
  "distinctive_features",
  "eye_color",
  "eye_shape",
  "eye_size",
  "eye_spacing",
  "canthal_tilt",
  "under_eye_detail",
  "facial_asymmetry",
  "expression",
  "presence_vibe",
  "gaze_intensity",
  "mouth_expression_detail",
  "brow_expression_detail",
  "portrait_framing",
  "casting_style",
  "gaze_direction",
  "head_pose",
  "eyelid_type",
  "eyebrow_density",
  "eyebrow_position",
  "brow_ridge_prominence",
  "nose_size",
  "nose_profile",
  "nose_length",
  "nose_bridge_width",
  "nose_tip_shape",
  "nostril_width",
  "nostril_visibility",
  "lip_fullness",
  "mouth_width",
  "mouth_shape",
  "cupid_bow_definition",
  "philtrum_length",
  "facial_fullness",
  "visible_body_build",
  "cheek_fullness",
  "cheekbone_height",
  "cheekbone_prominence",
  "jaw_shape",
  "chin_shape",
  "forehead_height",
  "neck_width",
  "shoulder_frame",
  "freckle_pattern",
  "wrinkle_level",
  "crow_feet",
  "nasolabial_folds",
  "pore_visibility"
]);

const arrayVisualFields = new Set([
  "piercings",
  "jewelry",
  "tattoos",
  "visible_scars",
  "cultural_styling",
  "distinctive_features"
]);

const fieldAliases: Record<string, Record<string, string>> = {
  eye_shape: {
    almond: "almond_eyes",
    round: "round_eyes",
    narrow: "narrow_eyes",
    deep_set: "deep_set_eyes",
    wide_open: "wide_open_eyes",
    sleepy: "sleepy_eyes",
    sharp: "sharp_eyes"
  },
  eye_color: {
    brown: "brown_eyes",
    gray: "gray_eyes"
  },
  nose_size: {
    medium: "medium_size"
  }
};

const emptyArrayValues = new Set([
  "none_visible",
  "no_visible_scars",
  "no_visible_jewelry",
  "no_specific_cultural_styling"
]);

const imageQualityFields: DataField[] = [
  { field: "face_visibility", values: ["fully_visible", "mostly_visible", "partially_visible", "not_visible"] },
  { field: "lighting_quality", values: ["even_diffuse_lighting", "harsh_lighting", "low_light", "mixed_lighting", "color_cast_lighting"] },
  { field: "occlusion_level", values: ["minimal_occlusion", "partial_occlusion", "heavy_occlusion"] }
];

function valuesWithUnknown(values: string[]) {
  return JSON.stringify([...values, "unknown"]);
}

function buildExtractionTemplate() {
  const fieldEntry = `{"value":"unknown","confidence":0.0}`;
  const section = (fields: DataField[]) => Object.fromEntries(fields.map(field => [field.field, JSON.parse(fieldEntry)]));

  return JSON.stringify({
    schema_version: "character_visual_extraction_v1",
    image_quality: {
      face_visibility: { value: "unknown", confidence: 0.0 },
      lighting_quality: { value: "unknown", confidence: 0.0 },
      occlusion_level: { value: "unknown", confidence: 0.0 },
      overall_extraction_confidence: 0.0
    },
    filter_fields: {
      apparent_age_years: { value: "unknown", confidence: 0.0 },
      apparent_age_group: { value: "unknown", confidence: 0.0 },
      gender_presentation: { value: "unknown", confidence: 0.0 },
      region_profile: { value: "unknown", confidence: 0.0, source: "not_inferred_from_image" },
      country_of_origin: { value: "unknown", confidence: 0.0, source: "not_inferred_from_image" }
    },
    facial_morphology: section(dataGroups.find(group => group.title === "Visual morphology")?.fields ?? []),
    hair_and_grooming: section(dataGroups.find(group => group.title === "Hair and grooming")?.fields ?? []),
    aging_and_skin_detail: section(dataGroups.find(group => group.title === "Aging, expression and pose")?.fields ?? []),
    visible_details: section(dataGroups.find(group => group.title === "Visible details and styling")?.fields ?? []),
    notes: {
      non_sensitive_visible_summary: "",
      uncertainty_notes: []
    }
  }, null, 2);
}

function buildVlmSystemPrompt() {
  const visualGroups = dataGroups.filter(group => group.title !== "Identity and casting");
  const enumLines = [
    "image_quality:",
    ...imageQualityFields.map(field => `${field.field}: ${valuesWithUnknown(field.values)}`),
    "",
    "filter_fields:",
    `apparent_age_years: number from 0 to 100 or "unknown"`,
    `apparent_age_group: ${valuesWithUnknown(optionData.ageGroups.map(group => group.id))}`,
    `gender_presentation: ${valuesWithUnknown(optionData.genderPresentations.map(group => group.id))}`,
    `region_profile: ${valuesWithUnknown(regionProfiles.map(region => region.id))}`,
    `country_of_origin: string from explicit metadata only, or "unknown"`,
    "",
    ...visualGroups.flatMap(group => [
      `${group.title}:`,
      ...group.fields.map(field => `${field.field}: ${valuesWithUnknown(field.values)}`),
      ""
    ])
  ].join("\n");

  return [
    "You are a visual attribute extraction model for a casting character database.",
    "",
    "Return valid JSON only. Do not write markdown, explanations, comments, or extra text.",
    "Analyze only visible attributes of the most prominent person in the image.",
    "",
    "Do not identify the person.",
    "Do not infer ethnicity, nationality, country of origin, religion, health status, income, social class, or protected attributes.",
    "Do not infer gender identity. You may describe visible gender presentation only as a visual presentation label.",
    "Do not infer origin or region profile from facial appearance. Only use explicit metadata if it is provided separately; otherwise return unknown.",
    "",
    "Prefer unknown over guessing. Never invent labels. Use only the enum values listed below.",
    "Every extracted field must include {\"value\": one allowed enum value, number, or \"unknown\", \"confidence\": number from 0.0 to 1.0}.",
    "",
    "For apparent age, estimate visible apparent age only, not real age. Return both apparent_age_years and apparent_age_group.",
    "For gender_presentation, use only visible presentation cues such as grooming, hairstyle, facial hair, clothing, and styling.",
    "For fields that are not clearly visible, return unknown and low confidence.",
    "",
    "Confidence rules:",
    "0.90-1.00: clearly visible and unambiguous",
    "0.70-0.89: visible with minor uncertainty",
    "0.50-0.69: partially visible or somewhat ambiguous",
    "0.20-0.49: weak evidence",
    "0.00-0.19: not visible or unreliable",
    "",
    "Allowed enum values:",
    enumLines,
    "Return JSON in exactly this structure:",
    buildExtractionTemplate()
  ].join("\n");
}

const vlmSystemPrompt = buildVlmSystemPrompt();

function isImportedField(value: unknown): value is ImportedField {
  return Boolean(value) && typeof value === "object" && "value" in value;
}

function stripJsonComments(input: string) {
  let output = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (inString) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      output += char;
      continue;
    }

    if (char === "/" && next === "/") {
      while (index < input.length && input[index] !== "\n") index += 1;
      output += "\n";
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (index < input.length && !(input[index] === "*" && input[index + 1] === "/")) index += 1;
      index += 1;
      continue;
    }

    output += char;
  }

  return output;
}

function appendMissingClosers(input: string) {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (const char of input) {
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      stack.push("}");
    } else if (char === "[") {
      stack.push("]");
    } else if ((char === "}" || char === "]") && stack[stack.length - 1] === char) {
      stack.pop();
    }
  }

  return input + stack.reverse().join("");
}

function parseLooseJson(input: string): { parsed: ImportedExtraction; warnings: string[] } {
  const warnings: string[] = [];
  let text = input.trim().replace(/^\uFEFF/, "");

  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    warnings.push("Removed markdown code fence.");
  }

  const firstBrace = text.indexOf("{");
  if (firstBrace > 0) {
    text = text.slice(firstBrace);
    warnings.push("Removed text before first JSON object.");
  }

  try {
    return { parsed: JSON.parse(text) as ImportedExtraction, warnings };
  } catch {
    // Continue with repair passes.
  }

  text = stripJsonComments(text);
  text = text.replace(/,\s*([}\]])/g, "$1").replace(/,\s*$/g, "");

  const lastBrace = text.lastIndexOf("}");
  if (lastBrace > 0 && lastBrace < text.length - 1) {
    text = text.slice(0, lastBrace + 1);
    warnings.push("Removed text after final closing brace.");
  }

  text = appendMissingClosers(text).replace(/,\s*([}\]])/g, "$1");
  warnings.push("Applied lenient JSON repair.");

  return { parsed: JSON.parse(text) as ImportedExtraction, warnings };
}

function normalizeImportedValue(field: string, value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const rawValue = String(value);
  if (rawValue === "unknown") return undefined;
  if (emptyArrayValues.has(rawValue)) return "";
  return fieldAliases[field]?.[rawValue] ?? rawValue;
}

function isAllowedImportedValue(field: string, value: string) {
  if (value === "") return true;
  return allowedValuesByField.get(field)?.has(value) ?? false;
}

function flattenImportedFields(input: ImportedExtraction) {
  const fields: Array<{ field: string; imported: ImportedField }> = [];

  for (const sectionValue of Object.values(input)) {
    if (!sectionValue || typeof sectionValue !== "object") continue;

    for (const [field, value] of Object.entries(sectionValue as Record<string, unknown>)) {
      if (isImportedField(value)) {
        fields.push({ field, imported: value });
      }
    }
  }

  return fields;
}

function buildImportDraft(input: ImportedExtraction, basePerson: GeneratedPerson): ImportDraft {
  const visual: VisualProfile = { ...basePerson.visual };
  const appliedFields: string[] = [];
  const ignoredFields: string[] = [];
  const warnings: string[] = [];
  let age = basePerson.age;
  let ageGroup = basePerson.age_group;
  let genderPresentation = basePerson.gender_presentation;

  for (const { field, imported } of flattenImportedFields(input)) {
    const normalized = normalizeImportedValue(field, imported.value);

    if (field === "apparent_age_years" && (typeof imported.value === "number" || typeof imported.value === "string")) {
      const parsedAge = Number(imported.value);
      if (!Number.isFinite(parsedAge)) {
        ignoredFields.push(field);
        warnings.push(`Ignored ${field}: value is not a number.`);
        continue;
      }
      age = Math.max(0, Math.min(100, Math.round(parsedAge)));
      appliedFields.push(field);
      continue;
    }

    if (field === "apparent_age_group" && typeof normalized === "string" && optionData.ageGroups.some(group => group.id === normalized)) {
      ageGroup = normalized as AgeGroup;
      appliedFields.push(field);
      continue;
    }

    if (field === "gender_presentation" && typeof normalized === "string" && optionData.genderPresentations.some(group => group.id === normalized)) {
      genderPresentation = normalized as GenderPresentation;
      appliedFields.push(field);
      continue;
    }

    if (!visualFieldNames.has(field) || normalized === undefined) {
      ignoredFields.push(field);
      continue;
    }

    if (!isAllowedImportedValue(field, normalized)) {
      ignoredFields.push(field);
      warnings.push(`Ignored ${field}: "${normalized}" is not in the current enum set.`);
      continue;
    }

    if (arrayVisualFields.has(field)) {
      (visual as unknown as Record<string, string[]>)[field] = normalized ? [normalized] : [];
    } else {
      (visual as unknown as Record<string, string>)[field] = normalized;
    }

    appliedFields.push(field);
  }

  const normalizedPerson: GeneratedPerson = {
    ...basePerson,
    id: `import_preview_${basePerson.id}`,
    display_name: "Imported preview",
    age,
    age_group: ageGroup,
    gender_presentation: genderPresentation,
    visual
  };
  return {
    normalizedPerson: {
      ...normalizedPerson,
      prompt_description: ""
    },
    appliedFields,
    ignoredFields: unique(ignoredFields),
    warnings
  };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 900);
  }

  return (
    <button className="secondary" onClick={copy}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function App() {
  const [region, setRegion] = useState<RegionProfileId | "random">("random");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | "random">("random");
  const [gender, setGender] = useState<GenderPresentation | "random">("random");
  const [campaign, setCampaign] = useState<CampaignType>("generic_casting");
  const [seed, setSeed] = useState(0);
  const [batchCount, setBatchCount] = useState<(typeof batchCountOptions)[number]>(100);
  const [promptList, setPromptList] = useState("");
  const [batchStatus, setBatchStatus] = useState("");
  const [viewMode, setViewMode] = useState<"profile" | "field_data" | "vlm_prompt" | "import_json">("profile");
  const [importJson, setImportJson] = useState("");
  const [importDraft, setImportDraft] = useState<ImportDraft | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importStatus, setImportStatus] = useState("");
  const [importAge, setImportAge] = useState("40");
  const [importAgeGroup, setImportAgeGroup] = useState<AgeGroup>("adult");
  const [importGender, setImportGender] = useState<GenderPresentation>("male_presenting");
  const [importCountry, setImportCountry] = useState("");
  const [importRegion, setImportRegion] = useState<RegionProfileId>("global_neutral");
  const isFullyRandom = region === "random" && ageGroup === "random" && gender === "random";

  const person = useMemo(() => {
    seed;
    return generatePerson({
      regionProfile: region,
      ageGroup,
      genderPresentation: gender,
      campaignType: campaign
    });
  }, [region, ageGroup, gender, campaign, seed]);

  async function generatePersonList() {
    const prompts = generatePersonBatch({
      count: batchCount,
      regionProfile: region,
      ageGroup,
      genderPresentation: gender,
      campaignType: campaign
    }).map(person => person.prompt_description.replace(/\s+/g, " ").trim());
    const output = prompts.join("\n");

    setPromptList(output);

    try {
      await navigator.clipboard.writeText(output);
      setBatchStatus(
        isFullyRandom
          ? `${batchCount} prompts generated, balanced for full-random mode, and copied.`
          : `${batchCount} prompts generated and copied.`
      );
    } catch {
      setBatchStatus(
        isFullyRandom
          ? `${batchCount} prompts generated in balanced full-random mode. Copy manually below.`
          : `${batchCount} prompts generated. Copy manually below.`
      );
    }
  }

  function parseImportJson() {
    try {
      const { parsed, warnings } = parseLooseJson(importJson);
      const draft = buildImportDraft(parsed, person);
      draft.warnings.unshift(...warnings);
      setImportDraft(draft);
      setImportResult(null);
      setImportAge(String(draft.normalizedPerson.age));
      setImportAgeGroup(draft.normalizedPerson.age_group);
      setImportGender(draft.normalizedPerson.gender_presentation);
      setImportCountry(draft.normalizedPerson.country_of_origin === "Unknown" ? "" : draft.normalizedPerson.country_of_origin);
      setImportRegion(draft.normalizedPerson.region_profile);
      setImportStatus(`${draft.appliedFields.length} fields imported. Set age/origin, then generate a prompt.`);
    } catch (error) {
      setImportDraft(null);
      setImportResult(null);
      setImportStatus(error instanceof Error ? error.message : "Could not parse JSON.");
    }
  }

  function generateImportedPrompt() {
    if (!importDraft) {
      setImportStatus("Import JSON first.");
      return;
    }

    const regionProfile = regionProfiles.find(region => region.id === importRegion);
    const ageValue = Number(importAge);
    const safeAge = Number.isFinite(ageValue) ? Math.max(0, Math.min(100, Math.round(ageValue))) : importDraft.normalizedPerson.age;
    const country = importCountry.trim() || "Unknown";
    const regionLabel = regionProfile?.label ?? "Random global";
    const personForPrompt: GeneratedPerson = {
      ...importDraft.normalizedPerson,
      age: safeAge,
      age_group: importAgeGroup,
      gender_presentation: importGender,
      region_profile: importRegion,
      region_label: regionLabel,
      country_of_origin: country,
      current_region: regionLabel,
      cultural_background: `${country} / ${regionLabel}`
    };
    const prompt = buildHeadshotPrompt(personForPrompt);

    setImportResult({
      ...importDraft,
      normalizedPerson: {
        ...personForPrompt,
        prompt_description: prompt
      },
      prompt
    });
    setImportStatus(`${importDraft.appliedFields.length} fields applied. Prompt generated.`);
  }

  const activePanelCopyText = viewMode === "profile"
    ? JSON.stringify(person, null, 2)
    : viewMode === "field_data"
      ? allFieldDataText
      : viewMode === "vlm_prompt"
        ? vlmSystemPrompt
        : importResult?.prompt ?? importJson;

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>AI Casting Headshot Generator</h1>
          <p>Data-driven photorealistic person profiles → prompt + negative prompt.</p>
        </div>

        <div className="topbarActions">
          <label className="compactLabel">
            List size
            <select value={batchCount} onChange={event => setBatchCount(Number(event.target.value) as (typeof batchCountOptions)[number])}>
              {batchCountOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button className="primary" onClick={() => setSeed(value => value + 1)}>
            Generate person
          </button>

          <button className="secondary" onClick={generatePersonList}>
            Generate person list
          </button>
        </div>
      </header>

      <section className="layout">
        <aside className="panel controls">
          <h2>Generator</h2>

          <label>
            Region profile
            <select value={region} onChange={event => setRegion(event.target.value as RegionProfileId | "random")}>
              <option value="random">Random global</option>
              {regionProfiles.map(region => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Age group
            <select value={ageGroup} onChange={event => setAgeGroup(event.target.value as AgeGroup | "random")}>
              {ageOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Gender presentation
            <select value={gender} onChange={event => setGender(event.target.value as GenderPresentation | "random")}>
              {genderOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Campaign type
            <select value={campaign} onChange={event => setCampaign(event.target.value as CampaignType)}>
              {campaignTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <div className="note">
            V1 gebruikt region-weighted visual probabilities, maar geen harde stereotypes. Bij Random global gebruikt de generator nu een neutralere mix in plaats van een impliciete regio-bias.
          </div>

          <div className="batchPanel">
            <div className="panelHeader">
              <h3>Batch prompt list</h3>
              {promptList ? <CopyButton text={promptList} /> : null}
            </div>

            <p className="batchStatus">
              {batchStatus || (
                isFullyRandom
                  ? `Genereert ${batchCount} prompts in balanced full-random mode om scheve streaks te beperken.`
                  : `Genereert ${batchCount} prompts op basis van de huidige filters.`
              )}
            </p>
            <textarea
              className="batchOutput"
              value={promptList}
              readOnly
              placeholder="Hier verschijnt de promptlijst. Elke prompt staat op één regel zonder interne enters."
            />
          </div>
        </aside>

        <section className="panel profile">
          <div className="panelHeader">
            <div className="tabs" aria-label="Profile view">
              <button className={viewMode === "profile" ? "tab active" : "tab"} onClick={() => setViewMode("profile")}>
                Generated profile
              </button>
              <button className={viewMode === "field_data" ? "tab active" : "tab"} onClick={() => setViewMode("field_data")}>
                Field data
              </button>
              <button className={viewMode === "vlm_prompt" ? "tab active" : "tab"} onClick={() => setViewMode("vlm_prompt")}>
                VL prompt
              </button>
              <button className={viewMode === "import_json" ? "tab active" : "tab"} onClick={() => setViewMode("import_json")}>
                Import JSON
              </button>
            </div>
            <CopyButton text={activePanelCopyText} />
          </div>

          {viewMode === "profile" ? (
            <div className="profileGrid">
              <div>
                <h3>Identity</h3>
                <dl>
                  <dt>Name</dt><dd>{person.display_name}</dd>
                  <dt>Age</dt><dd>{person.age} / {person.age_group}</dd>
                  <dt>Gender</dt><dd>{person.gender_presentation}</dd>
                  <dt>Origin</dt><dd>{person.cultural_background}</dd>
                  <dt>Languages</dt><dd>{person.languages.join(", ")}</dd>
                  <dt>Socioeconomic</dt><dd>{person.socioeconomic_context}</dd>
                  <dt>Profession</dt><dd>{person.profession_category}</dd>
                </dl>
              </div>

              <div>
                <h3>Visual morphology</h3>
                <dl>
                  {Object.entries(person.visual).map(([key, value]) => (
                    <div className="dlRow" key={key}>
                      <dt>{key}</dt>
                      <dd>{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ) : viewMode === "field_data" ? (
            <div className="fieldData">
              {dataGroups.map(group => (
                <section className="dataGroup" key={group.title}>
                  <h3>{group.title}</h3>
                  <dl>
                    {group.fields.map(field => (
                      <div className="dataRow" key={field.field}>
                        <dt>
                          {field.field}
                          {field.source ? <span>{field.source}</span> : null}
                        </dt>
                        <dd>[{field.values.join(", ")}]</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          ) : viewMode === "vlm_prompt" ? (
            <div className="toolView">
              <div className="panelHeader">
                <h3>Visual-language system prompt</h3>
                <CopyButton text={vlmSystemPrompt} />
              </div>
              <textarea className="largeOutput" value={vlmSystemPrompt} readOnly />
            </div>
          ) : viewMode === "import_json" ? (
            <div className="toolView">
              <div className="panelHeader">
                <h3>Import extraction JSON</h3>
                <button className="secondary" onClick={parseImportJson}>
                  Parse JSON
                </button>
              </div>

              <textarea
                className="largeOutput"
                value={importJson}
                onChange={event => setImportJson(event.target.value)}
                placeholder="Paste visual extraction JSON here."
              />

              <p className="batchStatus">{importStatus || "Paste JSON from the VL task, then convert it into a prompt preview."}</p>

              {importDraft ? (
                <div className="importControls">
                  <label>
                    Age
                    <input value={importAge} onChange={event => setImportAge(event.target.value)} />
                  </label>

                  <label>
                    Age group
                    <select value={importAgeGroup} onChange={event => setImportAgeGroup(event.target.value as AgeGroup)}>
                      {ageOptions.filter(option => option.id !== "random").map(option => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Gender presentation
                    <select value={importGender} onChange={event => setImportGender(event.target.value as GenderPresentation)}>
                      {genderOptions.filter(option => option.id !== "random").map(option => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Country / origin metadata
                    <input value={importCountry} onChange={event => setImportCountry(event.target.value)} placeholder="e.g. Italy" />
                  </label>

                  <label>
                    Region profile metadata
                    <select value={importRegion} onChange={event => setImportRegion(event.target.value as RegionProfileId)}>
                      <option value="global_neutral">Random global</option>
                      {regionProfiles.map(region => (
                        <option key={region.id} value={region.id}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button className="primary" onClick={generateImportedPrompt}>
                    Generate prompt
                  </button>
                </div>
              ) : null}

              {importDraft ? (
                <div className="profileGrid compactGrid">
                  <div>
                    <h3>Applied fields</h3>
                    <p>{importDraft.appliedFields.join(", ") || "None"}</p>
                  </div>
                  <div>
                    <h3>Ignored fields</h3>
                    <p>{importDraft.ignoredFields.join(", ") || "None"}</p>
                  </div>
                </div>
              ) : null}

              {importDraft?.warnings.length ? (
                <div>
                  <h3>Warnings</h3>
                  <p>{importDraft.warnings.join(" ")}</p>
                </div>
              ) : null}

              {importResult ? (
                <div className="importResult">
                  <div className="panelHeader">
                    <h3>Imported prompt preview</h3>
                    <CopyButton text={importResult.prompt} />
                  </div>
                  <textarea value={importResult.prompt} readOnly />

                  <div className="panelHeader">
                    <h3>Normalized preview JSON</h3>
                    <CopyButton text={JSON.stringify(importResult.normalizedPerson, null, 2)} />
                  </div>
                  <textarea className="largeOutput" value={JSON.stringify(importResult.normalizedPerson, null, 2)} readOnly />
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <aside className="panel prompt">
          <div className="panelHeader">
            <h2>Prompt</h2>
            <CopyButton text={person.prompt_description} />
          </div>

          <textarea value={person.prompt_description} readOnly />

          <div className="panelHeader">
            <h2>Negative prompt</h2>
            <CopyButton text={person.negative_prompt} />
          </div>

          <textarea className="negative" value={person.negative_prompt} readOnly />
        </aside>
      </section>
    </main>
  );
}
