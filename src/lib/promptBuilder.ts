import type { CampaignType, GeneratedPerson } from "../types";
import { commaList, phrase } from "./phrases";

const campaignContext: Record<CampaignType, string> = {
  generic_casting: "professional casting portrait",
  healthcare: "believable healthcare campaign portrait",
  education: "warm education campaign portrait",
  public_service: "trustworthy public-service campaign portrait",
  banking: "trustworthy banking and insurance campaign portrait",
  tech: "modern technology campaign portrait",
  fashion: "realistic fashion casting headshot, still natural and believable",
  beauty: "natural beauty campaign portrait with realistic skin",
  sports: "active lifestyle campaign portrait",
  family: "family-oriented lifestyle portrait",
  luxury: "understated premium campaign portrait",
  local_business: "local business campaign portrait"
};

const baldHairStates = new Set(["clean_shaved_bald", "closely_shaved_balding"]);

export function buildHeadshotPrompt(person: GeneratedPerson): string {
  const v = person.visual;
  const genderWord = phrase(person.gender_presentation);
  const vibe = commaList(person.casting.personality_vibe);
  const eyewearSentence = v.eyewear !== "no_eyewear"
    ? `Eyewear: ${phrase(v.eyewear)}.`
    : "";
  const piercingSentence = v.piercings.length > 0
    ? `Accessories and adornment: ${commaList(v.piercings.map(phrase))}.`
    : "";
  const jewelrySentence = v.jewelry.length > 0
    ? `Visible jewelry: ${commaList(v.jewelry.map(phrase))}.`
    : "";
  const tattooSentence = v.tattoos.length > 0
    ? `Visible tattoos: ${commaList(v.tattoos.map(phrase))}.`
    : "";
  const scarSentence = v.visible_scars.length > 0
    ? `Visible scar detail: ${commaList(v.visible_scars.map(phrase))}.`
    : "";
  const culturalStylingSentence = v.cultural_styling.length > 0
    ? `Styling cues: ${commaList(v.cultural_styling.map(phrase))}.`
    : "";
  const distinctiveSentence = v.distinctive_features.length > 0
    ? `Distinctive details: ${commaList(v.distinctive_features.map(phrase))}.`
    : "";
  const hairDetailBits = [
    v.hair_parting !== "parting_not_visible" ? phrase(v.hair_parting) : "",
    v.hair_finish !== "finish_not_emphasized" ? phrase(v.hair_finish) : "",
    phrase(v.hairline)
  ].filter(Boolean);
  const hairSentence = baldHairStates.has(v.hairline)
    ? `Hair: ${phrase(v.hairstyle)}, with ${phrase(v.hairline)}.`
    : `Hair: ${phrase(v.hair_color)} ${phrase(v.hair_type)} hair, worn in ${phrase(v.hairstyle)}, with ${commaList(hairDetailBits)}.`;

  return [
    `Photorealistic professional headshot of a ${person.age}-year-old ${person.country_of_origin} ${genderWord}.`,
    `The person has ${phrase(v.skin_tone)} with ${phrase(v.skin_undertone)}, ${phrase(v.skin_texture)}, ${phrase(v.face_shape)}, and ${phrase(v.head_shape)}.`,
    `Facial identity: ${phrase(v.eye_color)} ${phrase(v.eye_shape)} with ${phrase(v.eyelid_type)}, ${phrase(v.eyebrow_style)}, a ${phrase(v.nose_size)} ${phrase(v.nose_profile)}, ${phrase(v.lip_fullness)}, ${phrase(v.cheek_fullness)}, a ${phrase(v.jaw_shape)}, and ${phrase(v.facial_asymmetry)}.`,
    `Aging and realism: ${phrase(v.pore_visibility)}, ${phrase(v.wrinkle_level)} wrinkles, ${phrase(v.crow_feet)} crow’s feet, and ${phrase(v.nasolabial_folds)} nasolabial folds.`,
    `Pose and expression: ${phrase(v.expression)}, ${phrase(v.gaze_direction)}, and ${phrase(v.head_pose)}.`,
    hairSentence,
    `Facial hair: ${phrase(v.facial_hair)}.`,
    eyewearSentence,
    piercingSentence,
    jewelrySentence,
    tattooSentence,
    scarSentence,
    culturalStylingSentence,
    distinctiveSentence,
    `Expression and casting: ${vibe} presence, ${campaignContext[person.casting.campaign_type]}, grounded everyday realism, not a fashion-model caricature.`,
    `Photography: clean neutral studio background, soft natural studio lighting, realistic 85mm portrait lens, shallow depth of field, high-resolution facial detail, natural skin texture, realistic eyes, subtle imperfections, no glamour retouching.`
  ].filter(Boolean).join(" ");
}

export function buildNegativePrompt(): string {
  return [
    "cartoon",
    "anime",
    "CGI",
    "3D render",
    "plastic skin",
    "wax skin",
    "overly smooth skin",
    "beauty filter",
    "over-retouched",
    "fashion model exaggeration",
    "caricature",
    "ethnic stereotype",
    "distorted face",
    "asymmetrical eyes",
    "cross-eye",
    "bad teeth",
    "extra teeth",
    "deformed ears",
    "uncanny valley",
    "over-sharpened",
    "low resolution",
    "bad anatomy",
    "AI artifacts",
    "fake pores",
    "melting skin",
    "wrong age"
  ].join(", ");
}
