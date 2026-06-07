export type WeightedMap = Record<string, number>;

export type AgeGroup =
  | "child"
  | "teen"
  | "young_adult"
  | "adult"
  | "middle_aged"
  | "senior"
  | "elderly";

export type GenderPresentation =
  | "female_presenting"
  | "male_presenting"
  | "androgynous"
  | "non_binary_presenting";

export type RegionProfileId =
  | "global_neutral"
  | "western_europe"
  | "southern_europe"
  | "east_asia"
  | "south_asia"
  | "west_africa"
  | "north_africa_middle_east"
  | "latin_america"
  | "north_america";

export type CampaignType =
  | "generic_casting"
  | "healthcare"
  | "education"
  | "public_service"
  | "banking"
  | "tech"
  | "fashion"
  | "beauty"
  | "sports"
  | "family"
  | "luxury"
  | "local_business";

export type RegionVisualProfile = {
  id: RegionProfileId;
  label: string;
  countries: string[];
  languages: string[];
  skinToneWeights: WeightedMap;
  skinUndertoneWeights: WeightedMap;
  hairTypeWeights: WeightedMap;
  hairColorWeights: WeightedMap;
  eyeColorWeights: WeightedMap;
  faceShapeWeights: WeightedMap;
  headShapeWeights: WeightedMap;
  noseProfileWeights: WeightedMap;
  noseSizeWeights: WeightedMap;
  eyelidTypeWeights: WeightedMap;
  lipFullnessWeights: WeightedMap;
};

export type VisualProfile = {
  face_shape: string;
  head_shape: string;
  skin_tone: string;
  skin_undertone: string;
  skin_texture: string;
  eyebrow_style: string;
  hair_color: string;
  hair_type: string;
  hair_length: string;
  hairstyle: string;
  hairstyle_presentation: string;
  hair_parting: string;
  hair_finish: string;
  hairline: string;
  facial_hair: string;
  eyewear: string;
  piercings: string[];
  jewelry: string[];
  tattoos: string[];
  visible_scars: string[];
  cultural_styling: string[];
  distinctive_features: string[];
  eye_color: string;
  eye_shape: string;
  eye_size: string;
  eye_spacing: string;
  canthal_tilt: string;
  under_eye_detail: string;
  facial_asymmetry: string;
  expression: string;
  presence_vibe: string;
  gaze_intensity: string;
  mouth_expression_detail: string;
  brow_expression_detail: string;
  portrait_framing: string;
  casting_style: string;
  gaze_direction: string;
  head_pose: string;
  eyelid_type: string;
  eyebrow_density: string;
  eyebrow_position: string;
  brow_ridge_prominence: string;
  nose_size: string;
  nose_profile: string;
  nose_length: string;
  nose_bridge_width: string;
  nose_tip_shape: string;
  nostril_width: string;
  nostril_visibility: string;
  lip_fullness: string;
  mouth_width: string;
  mouth_shape: string;
  cupid_bow_definition: string;
  philtrum_length: string;
  facial_fullness: string;
  visible_body_build: string;
  cheek_fullness: string;
  cheekbone_height: string;
  cheekbone_prominence: string;
  jaw_shape: string;
  chin_shape: string;
  forehead_height: string;
  neck_width: string;
  shoulder_frame: string;
  freckle_pattern: string;
  wrinkle_level: string;
  crow_feet: string;
  nasolabial_folds: string;
  pore_visibility: string;
};

export type GeneratedPerson = {
  id: string;
  display_name: string;
  model_code: string;
  active: boolean;

  age: number;
  age_group: AgeGroup;
  gender_presentation: GenderPresentation;

  region_profile: RegionProfileId;
  region_label: string;
  country_of_origin: string;
  current_region: string;
  cultural_background: string;
  languages: string[];

  socioeconomic_context: string;
  urban_rural_context: string;
  profession_category: string;
  lifestyle_segment: string;

  visual: VisualProfile;

  casting: {
    campaign_type: CampaignType;
    personality_vibe: string[];
    suitable_campaign_types: CampaignType[];
  };

  prompt_description: string;
  negative_prompt: string;
};
