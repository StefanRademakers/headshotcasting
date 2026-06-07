import type { AgeGroup, CampaignType, GenderPresentation, RegionProfileId } from "../types";

export const ageGroups: Array<{ id: AgeGroup; label: string; minAge: number; maxAge: number; weight: number }> = [
  { id: "child", label: "Child", minAge: 5, maxAge: 12, weight: 0.05 },
  { id: "teen", label: "Teen", minAge: 13, maxAge: 17, weight: 0.07 },
  { id: "young_adult", label: "Young adult", minAge: 18, maxAge: 29, weight: 0.23 },
  { id: "adult", label: "Adult", minAge: 30, maxAge: 49, weight: 0.33 },
  { id: "middle_aged", label: "Middle aged", minAge: 50, maxAge: 64, weight: 0.20 },
  { id: "senior", label: "Senior", minAge: 65, maxAge: 79, weight: 0.10 },
  { id: "elderly", label: "Elderly", minAge: 80, maxAge: 92, weight: 0.02 }
];

export const genderPresentations: Array<{ id: GenderPresentation; label: string; weight: number }> = [
  { id: "female_presenting", label: "Female presenting", weight: 0.49 },
  { id: "male_presenting", label: "Male presenting", weight: 0.49 },
  { id: "androgynous", label: "Androgynous", weight: 0.015 },
  { id: "non_binary_presenting", label: "Non-binary presenting", weight: 0.005 }
];

export const campaignTypes: Array<{ id: CampaignType; label: string }> = [
  { id: "generic_casting", label: "Generic casting" },
  { id: "healthcare", label: "Healthcare" },
  { id: "education", label: "Education" },
  { id: "public_service", label: "Public service" },
  { id: "banking", label: "Banking / insurance" },
  { id: "tech", label: "Tech" },
  { id: "fashion", label: "Fashion" },
  { id: "beauty", label: "Beauty" },
  { id: "sports", label: "Sports" },
  { id: "family", label: "Family" },
  { id: "luxury", label: "Luxury" },
  { id: "local_business", label: "Local business" }
];

export const socioeconomicWeights = {
  low_income: 0.08,
  working_class: 0.22,
  lower_middle_class: 0.20,
  middle_class: 0.31,
  upper_middle_class: 0.14,
  affluent: 0.04,
  elite: 0.01
};

export const urbanRuralWeights = {
  rural: 0.08,
  small_town: 0.14,
  suburban: 0.24,
  urban: 0.36,
  metropolitan: 0.18
};

export const hairLengths = {
  shaved: 0.04,
  buzz_cut: 0.07,
  short: 0.24,
  medium: 0.25,
  shoulder_length: 0.22,
  long: 0.15,
  very_long: 0.03
};

export const hairLengthProfiles: Record<GenderPresentation, typeof hairLengths> = {
  female_presenting: {
    shaved: 0.005,
    buzz_cut: 0.01,
    short: 0.08,
    medium: 0.16,
    shoulder_length: 0.25,
    long: 0.31,
    very_long: 0.185
  },
  male_presenting: {
    shaved: 0.06,
    buzz_cut: 0.14,
    short: 0.42,
    medium: 0.20,
    shoulder_length: 0.10,
    long: 0.06,
    very_long: 0.02
  },
  androgynous: {
    shaved: 0.02,
    buzz_cut: 0.06,
    short: 0.22,
    medium: 0.24,
    shoulder_length: 0.21,
    long: 0.18,
    very_long: 0.07
  },
  non_binary_presenting: {
    shaved: 0.02,
    buzz_cut: 0.05,
    short: 0.18,
    medium: 0.23,
    shoulder_length: 0.22,
    long: 0.22,
    very_long: 0.08
  }
};

export const hairPartings = {
  center_part: 0.22,
  soft_off_center_part: 0.26,
  deep_side_part: 0.10,
  broken_center_part: 0.10,
  loose_side_sweep: 0.08,
  tucked_behind_one_ear: 0.08,
  brushed_back_off_face: 0.08,
  no_defined_part: 0.08
};

export const hairFinishes = {
  smooth_polished_finish: 0.16,
  soft_natural_blowout: 0.18,
  air_dried_lived_in_texture: 0.18,
  subtle_bend_through_lengths: 0.16,
  natural_body_and_movement: 0.16,
  piecey_tousled_texture: 0.10,
  sleek_mostly_straight_finish: 0.06
};

export const eyebrowStyles = {
  straight_soft_brows: 0.16,
  softly_arched_brows: 0.28,
  defined_arched_brows: 0.16,
  full_natural_brows: 0.22,
  feathered_brows: 0.10,
  low_straight_brows: 0.08
};

export const hairstyleProfiles: Array<{
  id: string;
  label: string;
  weight: number;
  compatibleLengths: string[];
  compatibleHairTypes?: string[];
  compatiblePresentations?: GenderPresentation[];
  presentationCoding: "masculine_coded" | "feminine_coded" | "neutral_coded";
  partingVisible?: boolean;
  preferredPartings?: string[];
  preferredFinishes?: string[];
}> = [
  {
    id: "clean_shaved_head",
    label: "Clean shaved head",
    weight: 0.02,
    compatibleLengths: ["shaved"],
    compatiblePresentations: ["male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "masculine_coded",
    partingVisible: false
  },
  {
    id: "buzz_cut_fade",
    label: "Buzz cut fade",
    weight: 0.04,
    compatibleLengths: ["buzz_cut"],
    compatiblePresentations: ["male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "masculine_coded",
    partingVisible: false,
    preferredFinishes: ["smooth_polished_finish"]
  },
  {
    id: "textured_crop",
    label: "Textured crop",
    weight: 0.06,
    compatibleLengths: ["short"],
    compatibleHairTypes: ["straight", "wavy", "curly"],
    compatiblePresentations: ["male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "masculine_coded",
    preferredPartings: ["soft_off_center_part", "no_defined_part"],
    preferredFinishes: ["piecey_tousled_texture", "natural_body_and_movement"]
  },
  {
    id: "textured_pixie_cut",
    label: "Textured pixie cut",
    weight: 0.06,
    compatibleLengths: ["short"],
    compatibleHairTypes: ["straight", "wavy", "curly"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    preferredPartings: ["soft_off_center_part", "deep_side_part", "no_defined_part"],
    preferredFinishes: ["piecey_tousled_texture", "natural_body_and_movement"]
  },
  {
    id: "short_side_part",
    label: "Short side part",
    weight: 0.05,
    compatibleLengths: ["short", "medium"],
    compatibleHairTypes: ["straight", "wavy"],
    compatiblePresentations: ["male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "masculine_coded",
    preferredPartings: ["deep_side_part", "soft_off_center_part"],
    preferredFinishes: ["smooth_polished_finish", "soft_natural_blowout"]
  },
  {
    id: "slicked_back_short_style",
    label: "Slicked-back short style",
    weight: 0.04,
    compatibleLengths: ["short", "medium"],
    compatibleHairTypes: ["straight", "wavy", "curly"],
    compatiblePresentations: ["male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "masculine_coded",
    preferredPartings: ["brushed_back_off_face"],
    preferredFinishes: ["smooth_polished_finish"]
  },
  {
    id: "jaw_length_blunt_bob",
    label: "Jaw-length blunt bob",
    weight: 0.06,
    compatibleLengths: ["short", "medium"],
    compatibleHairTypes: ["straight", "wavy"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    preferredPartings: ["center_part", "soft_off_center_part", "deep_side_part"],
    preferredFinishes: ["smooth_polished_finish", "sleek_mostly_straight_finish"]
  },
  {
    id: "layered_bob_with_curtain_bangs",
    label: "Layered bob with curtain bangs",
    weight: 0.08,
    compatibleLengths: ["short", "medium", "shoulder_length"],
    compatibleHairTypes: ["straight", "wavy", "curly"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    preferredPartings: ["center_part", "broken_center_part", "soft_off_center_part"],
    preferredFinishes: ["soft_natural_blowout", "natural_body_and_movement"]
  },
  {
    id: "shaggy_long_bob",
    label: "Shaggy long bob",
    weight: 0.08,
    compatibleLengths: ["medium", "shoulder_length", "long"],
    compatibleHairTypes: ["straight", "wavy", "curly"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    preferredPartings: ["soft_off_center_part", "broken_center_part", "no_defined_part"],
    preferredFinishes: ["piecey_tousled_texture", "air_dried_lived_in_texture"]
  },
  {
    id: "shoulder_length_layered_cut",
    label: "Shoulder-length layered cut",
    weight: 0.08,
    compatibleLengths: ["medium", "shoulder_length", "long"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "neutral_coded",
    preferredPartings: ["soft_off_center_part", "center_part", "tucked_behind_one_ear"],
    preferredFinishes: ["natural_body_and_movement", "soft_natural_blowout", "air_dried_lived_in_texture"]
  },
  {
    id: "collarbone_straight_layers",
    label: "Collarbone straight layers",
    weight: 0.08,
    compatibleLengths: ["shoulder_length", "long"],
    compatibleHairTypes: ["straight", "wavy"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    preferredPartings: ["soft_off_center_part", "center_part", "tucked_behind_one_ear"],
    preferredFinishes: ["sleek_mostly_straight_finish", "natural_body_and_movement", "air_dried_lived_in_texture"]
  },
  {
    id: "soft_waves_center_part",
    label: "Soft waves with center part",
    weight: 0.06,
    compatibleLengths: ["shoulder_length", "long", "very_long"],
    compatibleHairTypes: ["straight", "wavy"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    preferredPartings: ["center_part", "broken_center_part"],
    preferredFinishes: ["subtle_bend_through_lengths", "soft_natural_blowout"]
  },
  {
    id: "long_loose_straight_layers",
    label: "Long loose straight layers",
    weight: 0.10,
    compatibleLengths: ["shoulder_length", "long", "very_long"],
    compatibleHairTypes: ["straight", "wavy"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    preferredPartings: ["soft_off_center_part", "center_part", "tucked_behind_one_ear"],
    preferredFinishes: ["air_dried_lived_in_texture", "natural_body_and_movement", "sleek_mostly_straight_finish"]
  },
  {
    id: "smooth_long_face_framing_layers",
    label: "Smooth long face-framing layers",
    weight: 0.09,
    compatibleLengths: ["long", "very_long"],
    compatibleHairTypes: ["straight", "wavy"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    preferredPartings: ["soft_off_center_part", "center_part", "deep_side_part"],
    preferredFinishes: ["soft_natural_blowout", "sleek_mostly_straight_finish", "natural_body_and_movement"]
  },
  {
    id: "long_soft_blowout_layers",
    label: "Long soft blowout layers",
    weight: 0.07,
    compatibleLengths: ["long", "very_long"],
    compatibleHairTypes: ["straight", "wavy"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    preferredPartings: ["soft_off_center_part", "deep_side_part", "center_part"],
    preferredFinishes: ["soft_natural_blowout", "subtle_bend_through_lengths"]
  },
  {
    id: "long_face_framing_layers",
    label: "Long face-framing layers",
    weight: 0.08,
    compatibleLengths: ["long", "very_long"],
    compatibleHairTypes: ["straight", "wavy", "curly"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    preferredPartings: ["center_part", "soft_off_center_part", "tucked_behind_one_ear"],
    preferredFinishes: ["natural_body_and_movement", "soft_natural_blowout"]
  },
  {
    id: "sleek_low_ponytail",
    label: "Sleek low ponytail",
    weight: 0.05,
    compatibleLengths: ["shoulder_length", "long", "very_long"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "neutral_coded",
    preferredPartings: ["center_part", "deep_side_part", "brushed_back_off_face"],
    preferredFinishes: ["smooth_polished_finish", "sleek_mostly_straight_finish"]
  },
  {
    id: "messy_top_knot",
    label: "Messy top knot",
    weight: 0.05,
    compatibleLengths: ["shoulder_length", "long", "very_long"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "neutral_coded",
    partingVisible: false,
    preferredFinishes: ["piecey_tousled_texture", "air_dried_lived_in_texture"]
  },
  {
    id: "braided_crown_updo",
    label: "Braided crown updo",
    weight: 0.03,
    compatibleLengths: ["long", "very_long"],
    compatibleHairTypes: ["straight", "wavy", "curly", "coily", "kinky_coily"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "feminine_coded",
    partingVisible: false,
    preferredFinishes: ["natural_body_and_movement"]
  },
  {
    id: "defined_natural_curl_shape",
    label: "Defined natural curl shape",
    weight: 0.06,
    compatibleLengths: ["short", "medium", "shoulder_length"],
    compatibleHairTypes: ["curly", "coily", "kinky_coily"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "neutral_coded",
    preferredPartings: ["no_defined_part", "soft_off_center_part"],
    preferredFinishes: ["natural_body_and_movement", "air_dried_lived_in_texture"]
  },
  {
    id: "tapered_coil_cut",
    label: "Tapered coil cut",
    weight: 0.05,
    compatibleLengths: ["short"],
    compatibleHairTypes: ["coily", "kinky_coily"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "neutral_coded",
    partingVisible: false,
    preferredFinishes: ["natural_body_and_movement"]
  },
  {
    id: "two_strand_twists",
    label: "Two-strand twists",
    weight: 0.05,
    compatibleLengths: ["short", "medium", "shoulder_length", "long"],
    compatibleHairTypes: ["curly", "coily", "kinky_coily"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "neutral_coded",
    preferredPartings: ["center_part", "soft_off_center_part", "no_defined_part"],
    preferredFinishes: ["natural_body_and_movement"]
  },
  {
    id: "box_braids",
    label: "Box braids",
    weight: 0.05,
    compatibleLengths: ["medium", "shoulder_length", "long", "very_long"],
    compatibleHairTypes: ["curly", "coily", "kinky_coily"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "neutral_coded",
    preferredPartings: ["center_part", "soft_off_center_part"],
    preferredFinishes: ["natural_body_and_movement"]
  },
  {
    id: "locs_pulled_back",
    label: "Locs pulled back",
    weight: 0.04,
    compatibleLengths: ["medium", "shoulder_length", "long", "very_long"],
    compatibleHairTypes: ["curly", "coily", "kinky_coily"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "neutral_coded",
    preferredPartings: ["brushed_back_off_face", "center_part", "no_defined_part"],
    preferredFinishes: ["natural_body_and_movement"]
  },
  {
    id: "flat_twist_bun",
    label: "Flat-twist bun",
    weight: 0.02,
    compatibleLengths: ["medium", "shoulder_length", "long"],
    compatibleHairTypes: ["coily", "kinky_coily"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"],
    presentationCoding: "neutral_coded",
    partingVisible: false,
    preferredFinishes: ["natural_body_and_movement"]
  }
];

export const hairlineProfiles = {
  child: {
    full_hairline: 0.995,
    mature_hairline: 0.005
  },
  teen: {
    full_hairline: 0.99,
    mature_hairline: 0.01
  },
  young_adult_default: {
    full_hairline: 0.93,
    mature_hairline: 0.05,
    slightly_receding_hairline: 0.015,
    receding_hairline: 0.005
  },
  young_adult_male: {
    full_hairline: 0.72,
    mature_hairline: 0.14,
    slightly_receding_hairline: 0.09,
    receding_hairline: 0.03,
    thinning_crown: 0.01,
    closely_shaved_balding: 0.01
  },
  adult_default: {
    full_hairline: 0.86,
    mature_hairline: 0.08,
    slightly_receding_hairline: 0.04,
    receding_hairline: 0.015,
    thinning_crown: 0.005
  },
  adult_male: {
    full_hairline: 0.38,
    mature_hairline: 0.20,
    slightly_receding_hairline: 0.16,
    receding_hairline: 0.12,
    thinning_crown: 0.08,
    balding_top: 0.03,
    closely_shaved_balding: 0.02,
    clean_shaved_bald: 0.01
  },
  middle_aged_default: {
    full_hairline: 0.76,
    mature_hairline: 0.10,
    slightly_receding_hairline: 0.07,
    receding_hairline: 0.04,
    thinning_crown: 0.02,
    balding_top: 0.01
  },
  middle_aged_male: {
    mature_hairline: 0.16,
    slightly_receding_hairline: 0.16,
    receding_hairline: 0.20,
    thinning_crown: 0.18,
    balding_top: 0.14,
    closely_shaved_balding: 0.10,
    clean_shaved_bald: 0.06
  },
  senior_default: {
    full_hairline: 0.66,
    mature_hairline: 0.12,
    slightly_receding_hairline: 0.08,
    receding_hairline: 0.06,
    thinning_crown: 0.05,
    balding_top: 0.02,
    closely_shaved_balding: 0.01
  },
  senior_male: {
    mature_hairline: 0.10,
    slightly_receding_hairline: 0.12,
    receding_hairline: 0.18,
    thinning_crown: 0.18,
    balding_top: 0.20,
    closely_shaved_balding: 0.12,
    clean_shaved_bald: 0.10
  },
  elderly_default: {
    full_hairline: 0.50,
    mature_hairline: 0.14,
    slightly_receding_hairline: 0.10,
    receding_hairline: 0.10,
    thinning_crown: 0.10,
    balding_top: 0.04,
    closely_shaved_balding: 0.01,
    clean_shaved_bald: 0.01
  },
  elderly_male: {
    mature_hairline: 0.08,
    slightly_receding_hairline: 0.06,
    receding_hairline: 0.14,
    thinning_crown: 0.18,
    balding_top: 0.24,
    closely_shaved_balding: 0.16,
    clean_shaved_bald: 0.14
  }
};

export const distinctiveFeatureProfiles: Array<{
  id: string;
  weight: number;
}> = [
  { id: "faint_freckles_across_nose", weight: 0.18 },
  { id: "single_beauty_mark_on_cheek", weight: 0.10 },
  { id: "subtle_eyebrow_scar", weight: 0.06 },
  { id: "soft_dimples", weight: 0.14 },
  { id: "slight_under_eye_hollows", weight: 0.14 },
  { id: "rosy_cheeks", weight: 0.14 },
  { id: "slightly_chapped_lips", weight: 0.08 },
  { id: "sun_touched_freckles", weight: 0.10 },
  { id: "one_crooked_front_tooth", weight: 0.06 }
];

export const piercingProfiles: Array<{
  id: string;
  weight: number;
  compatiblePresentations?: GenderPresentation[];
}> = [
  {
    id: "small_lobe_studs",
    weight: 0.22,
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "small_hoop_earrings",
    weight: 0.16,
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "multiple_lobe_piercings",
    weight: 0.12,
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "single_helix_piercing",
    weight: 0.10,
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "double_helix_piercing",
    weight: 0.05,
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "nostril_stud",
    weight: 0.10,
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "septum_ring",
    weight: 0.07,
    compatiblePresentations: ["male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "eyebrow_piercing",
    weight: 0.05,
    compatiblePresentations: ["male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "small_nose_ring",
    weight: 0.07,
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "subtle_lip_ring",
    weight: 0.06,
    compatiblePresentations: ["male_presenting", "female_presenting", "androgynous", "non_binary_presenting"]
  }
];

export const tattooProfiles: Array<{
  id: string;
  weight: number;
  compatiblePresentations?: GenderPresentation[];
}> = [
  {
    id: "small_fine_line_neck_tattoo",
    weight: 0.24,
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "subtle_behind_ear_tattoo",
    weight: 0.18,
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "small_collarbone_script_tattoo",
    weight: 0.18,
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "minimal_blackwork_neck_tattoo",
    weight: 0.14,
    compatiblePresentations: ["male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "tiny_star_tattoo_near_neckline",
    weight: 0.10,
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "small_botanical_tattoo_at_collarbone",
    weight: 0.08,
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "micro_symbol_tattoo_behind_ear",
    weight: 0.08,
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  }
];

export const eyewearProfiles: Array<{
  id: string;
  weight: number;
  compatibleAges?: AgeGroup[];
}> = [
  { id: "no_eyewear", weight: 0.70 },
  { id: "thin_metal_round_glasses", weight: 0.06, compatibleAges: ["child", "teen", "young_adult", "adult", "middle_aged", "senior", "elderly"] },
  { id: "soft_rectangular_acetate_glasses", weight: 0.07, compatibleAges: ["child", "teen", "young_adult", "adult", "middle_aged", "senior", "elderly"] },
  { id: "clear_frame_glasses", weight: 0.04, compatibleAges: ["child", "teen", "young_adult", "adult"] },
  { id: "wireframe_oval_glasses", weight: 0.04, compatibleAges: ["adult", "middle_aged", "senior", "elderly"] },
  { id: "subtle_cat_eye_glasses", weight: 0.03, compatibleAges: ["young_adult", "adult", "middle_aged"] },
  { id: "simple_reading_glasses", weight: 0.04, compatibleAges: ["middle_aged", "senior", "elderly"] },
  { id: "modern_rectangular_glasses", weight: 0.02, compatibleAges: ["young_adult", "adult", "middle_aged"] }
];

export const jewelryProfiles: Array<{
  id: string;
  weight: number;
  compatiblePresentations?: GenderPresentation[];
}> = [
  { id: "no_visible_jewelry", weight: 0.40, compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"] },
  { id: "fine_gold_chain", weight: 0.10, compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"] },
  { id: "small_pendant_necklace", weight: 0.09, compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"] },
  { id: "simple_silver_chain", weight: 0.08, compatiblePresentations: ["male_presenting", "female_presenting", "androgynous", "non_binary_presenting"] },
  { id: "small_pearl_earrings", weight: 0.06, compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"] },
  { id: "small_gold_hoops", weight: 0.08, compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"] },
  { id: "minimalist_ear_cuff", weight: 0.05, compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"] },
  { id: "beaded_necklace", weight: 0.05, compatiblePresentations: ["male_presenting", "female_presenting", "androgynous", "non_binary_presenting"] },
  { id: "layered_delicate_necklaces", weight: 0.05, compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"] },
  { id: "signet_ring_visible_near_face", weight: 0.04, compatiblePresentations: ["male_presenting", "female_presenting", "androgynous", "non_binary_presenting"] }
];

export const visibleScarProfiles: Array<{
  id: string;
  weight: number;
}> = [
  { id: "no_visible_scars", weight: 0.74 },
  { id: "faint_eyebrow_scar", weight: 0.08 },
  { id: "small_chin_scar", weight: 0.05 },
  { id: "faint_scar_near_upper_lip", weight: 0.04 },
  { id: "subtle_temple_scar", weight: 0.03 },
  { id: "small_healed_forehead_line", weight: 0.03 },
  { id: "soft_jawline_scar", weight: 0.03 }
];

export const culturalStylingProfiles: Array<{
  id: string;
  weight: number;
  compatibleRegions?: RegionProfileId[];
  compatiblePresentations?: GenderPresentation[];
}> = [
  {
    id: "no_specific_cultural_styling",
    weight: 0.76,
    compatibleRegions: ["global_neutral", "western_europe", "southern_europe", "east_asia", "south_asia", "west_africa", "north_africa_middle_east", "latin_america", "north_america"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "neatly_draped_headscarf",
    weight: 0.04,
    compatibleRegions: ["north_africa_middle_east", "western_europe", "south_asia", "north_america"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "printed_headwrap",
    weight: 0.04,
    compatibleRegions: ["west_africa", "north_america", "latin_america"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "simple_turban_wrap",
    weight: 0.03,
    compatibleRegions: ["south_asia", "north_america", "western_europe"],
    compatiblePresentations: ["male_presenting", "female_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "embroidered_collar_detail",
    weight: 0.05,
    compatibleRegions: ["south_asia", "north_africa_middle_east", "latin_america", "west_africa"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "traditional_textile_scarf_detail",
    weight: 0.04,
    compatibleRegions: ["south_asia", "west_africa", "latin_america", "north_africa_middle_east"],
    compatiblePresentations: ["female_presenting", "male_presenting", "androgynous", "non_binary_presenting"]
  },
  {
    id: "modest_draped_shoulder_scarf",
    weight: 0.04,
    compatibleRegions: ["north_africa_middle_east", "south_asia", "western_europe", "north_america"],
    compatiblePresentations: ["female_presenting", "androgynous", "non_binary_presenting"]
  }
];

export const eyeShapes = {
  almond_eyes: 0.34,
  round_eyes: 0.20,
  narrow_eyes: 0.12,
  deep_set_eyes: 0.13,
  wide_open_eyes: 0.09,
  sleepy_eyes: 0.06,
  sharp_eyes: 0.06
};

export const eyeSizes = {
  small_eyes: 0.14,
  medium_eyes: 0.58,
  large_eyes: 0.22,
  very_large_eyes: 0.06
};

export const eyeSpacing = {
  close_set_eyes: 0.12,
  balanced_eye_spacing: 0.68,
  wide_set_eyes: 0.20
};

export const canthalTilts = {
  neutral_canthal_tilt: 0.54,
  slight_positive_canthal_tilt: 0.24,
  slight_negative_canthal_tilt: 0.12,
  level_outer_eye_corners: 0.10
};

export const underEyeDetails = {
  smooth_under_eye_area: 0.30,
  slight_under_eye_hollows: 0.22,
  soft_under_eye_fullness: 0.18,
  faint_under_eye_shadows: 0.18,
  visible_tear_troughs: 0.08,
  mild_under_eye_lines: 0.04
};

export const eyebrowDensity = {
  sparse_brows: 0.08,
  medium_density_brows: 0.42,
  full_brows: 0.34,
  very_full_brows: 0.16
};

export const eyebrowPosition = {
  low_set_brows: 0.20,
  balanced_brow_position: 0.58,
  high_set_brows: 0.14,
  slightly_uneven_brow_position: 0.08
};

export const browRidgeProminence = {
  soft_brow_ridge: 0.34,
  subtle_brow_ridge: 0.36,
  defined_brow_ridge: 0.20,
  prominent_brow_ridge: 0.10
};

export const facialAsymmetryWeights = {
  nearly_symmetrical_with_minor_variation: 0.34,
  subtle_left_right_facial_asymmetry: 0.28,
  slight_brow_height_asymmetry: 0.14,
  slight_eye_opening_asymmetry: 0.12,
  slight_mouth_corner_asymmetry: 0.12
};

export const expressionWeights = {
  relaxed_neutral_expression: 0.27,
  faint_closed_mouth_smile: 0.18,
  subtle_half_smile: 0.17,
  thoughtful_quiet_expression: 0.16,
  composed_serious_expression: 0.12,
  soft_open_expression: 0.06,
  curious_attentive_expression: 0.04
};

export const presenceVibes = {
  natural_everyday_presence: 0.26,
  soft_approachable_presence: 0.20,
  calm_confident_presence: 0.18,
  quiet_intense_presence: 0.12,
  cool_detached_presence: 0.10,
  editorial_composed_presence: 0.08,
  raw_street_casting_presence: 0.06
};

export const gazeIntensity = {
  soft_gaze_intensity: 0.22,
  neutral_gaze_intensity: 0.34,
  focused_gaze_intensity: 0.24,
  intense_gaze_intensity: 0.12,
  distant_gaze_intensity: 0.08
};

export const mouthExpressionDetails = {
  relaxed_closed_mouth: 0.30,
  neutral_closed_lips: 0.28,
  firm_closed_lips: 0.16,
  slightly_pursed_lips: 0.10,
  soft_hint_of_smile: 0.12,
  parted_relaxed_lips: 0.04
};

export const browExpressionDetails = {
  relaxed_brow_expression: 0.42,
  subtle_brow_focus: 0.24,
  slight_brow_furrow: 0.14,
  lifted_attentive_brows: 0.10,
  asymmetric_brow_interest: 0.06,
  intense_brow_tension: 0.04
};

export const portraitFraming = {
  tight_headshot_framing: 0.24,
  head_and_shoulders_framing: 0.36,
  medium_close_up_framing: 0.24,
  close_cropped_face_framing: 0.08,
  relaxed_portrait_crop: 0.08
};

export const castingStyles = {
  clean_commercial_casting: 0.28,
  natural_lifestyle_casting: 0.22,
  raw_editorial_casting: 0.14,
  cool_fashion_casting: 0.12,
  office_professional_casting: 0.12,
  character_extra_casting: 0.08,
  premium_minimal_casting: 0.04
};

export const gazeDirectionWeights = {
  direct_camera_gaze: 0.58,
  slightly_off_camera_gaze: 0.24,
  soft_side_glance: 0.10,
  lowered_thoughtful_gaze: 0.08
};

export const headPoseWeights = {
  straight_on_head_position: 0.44,
  slight_head_tilt: 0.20,
  subtle_three_quarter_turn: 0.14,
  slight_chin_down: 0.10,
  slight_chin_up: 0.06,
  gentle_head_turn_with_tilt: 0.06
};

export const cheekFullness = {
  flat_cheeks: 0.08,
  subtle_fullness: 0.22,
  soft_fullness: 0.34,
  full: 0.24,
  very_full: 0.12
};

export const cheekboneHeights = {
  low_cheekbones: 0.12,
  mid_set_cheekbones: 0.48,
  high_cheekbones: 0.30,
  very_high_cheekbones: 0.10
};

export const cheekboneProminence = {
  soft_cheekbones: 0.26,
  subtle_cheekbone_definition: 0.34,
  defined_cheekbones: 0.26,
  prominent_cheekbones: 0.14
};

export const facialFullness = {
  gaunt_face: 0.03,
  lean_face: 0.10,
  slim_face: 0.18,
  average_facial_fullness: 0.36,
  softly_full_face: 0.20,
  full_face: 0.10,
  very_full_face: 0.03
};

export const visibleBodyBuild = {
  slender_visible_build: 0.14,
  lean_visible_build: 0.16,
  average_visible_build: 0.38,
  sturdy_visible_build: 0.14,
  broad_visible_build: 0.10,
  heavyset_visible_build: 0.06,
  very_heavy_visible_build: 0.02
};

export const jawShapes = {
  soft_jaw: 0.24,
  rounded_jaw: 0.22,
  soft_square_jaw: 0.22,
  angular_jaw: 0.16,
  narrow_jaw: 0.10,
  broad_jaw: 0.06
};

export const noseBridgeWidths = {
  narrow_bridge: 0.18,
  medium_bridge_width: 0.54,
  broad_bridge: 0.22,
  softly_defined_bridge: 0.06
};

export const noseLengths = {
  short_nose: 0.14,
  medium_length_nose: 0.58,
  long_nose: 0.22,
  very_long_nose: 0.06
};

export const noseTipShapes = {
  rounded_nose_tip: 0.30,
  softly_defined_nose_tip: 0.32,
  narrow_nose_tip: 0.12,
  bulbous_nose_tip: 0.10,
  slightly_upturned_tip: 0.10,
  slightly_downturned_tip: 0.06
};

export const nostrilWidths = {
  narrow_nostrils: 0.18,
  medium_nostril_width: 0.56,
  broad_nostrils: 0.20,
  flared_nostrils: 0.06
};

export const nostrilVisibility = {
  low_nostril_visibility: 0.38,
  moderate_nostril_visibility: 0.48,
  visible_nostril_openings: 0.14
};

export const mouthWidths = {
  narrow_mouth: 0.16,
  medium_width_mouth: 0.56,
  wide_mouth: 0.24,
  very_wide_mouth: 0.04
};

export const mouthShapes = {
  softly_curved_mouth: 0.30,
  straight_mouth_line: 0.24,
  bow_shaped_mouth: 0.16,
  full_rounded_mouth: 0.18,
  asymmetrical_mouth_shape: 0.08,
  downturned_resting_mouth: 0.04
};

export const cupidBowDefinition = {
  soft_cupid_bow: 0.36,
  defined_cupid_bow: 0.32,
  subtle_cupid_bow: 0.22,
  flat_upper_lip_bow: 0.10
};

export const philtrumLengths = {
  short_philtrum: 0.14,
  average_philtrum: 0.62,
  long_philtrum: 0.20,
  very_long_philtrum: 0.04
};

export const chinShapes = {
  softly_rounded_chin: 0.30,
  balanced_chin: 0.34,
  narrow_chin: 0.12,
  broad_chin: 0.10,
  pointed_chin: 0.08,
  cleft_chin: 0.06
};

export const foreheadHeights = {
  low_forehead: 0.12,
  balanced_forehead: 0.56,
  high_forehead: 0.24,
  broad_forehead: 0.08
};

export const neckWidths = {
  slender_neck: 0.18,
  average_neck_width: 0.50,
  sturdy_neck: 0.18,
  broad_neck: 0.10,
  soft_full_neck: 0.04
};

export const shoulderFrames = {
  narrow_shoulders: 0.14,
  average_shoulder_frame: 0.48,
  gently_sloped_shoulders: 0.16,
  square_shoulders: 0.12,
  broad_shoulders: 0.10
};

export const frecklePatterns = {
  no_visible_freckles: 0.58,
  faint_freckles_across_nose: 0.14,
  light_cheek_freckles: 0.10,
  sun_touched_freckles: 0.08,
  scattered_face_freckles: 0.06,
  dense_freckles_across_face: 0.04
};

export const professionByCampaign: Record<CampaignType, string[]> = {
  generic_casting: ["everyday person", "local resident", "professional", "parent", "student", "retiree"],
  healthcare: ["nurse", "doctor", "pharmacist", "care worker", "healthcare administrator", "patient"],
  education: ["teacher", "student", "school administrator", "parent", "lecturer"],
  public_service: ["civil servant", "community worker", "local resident", "public advisor"],
  banking: ["financial advisor", "small business owner", "office worker", "customer"],
  tech: ["software developer", "product designer", "startup founder", "IT specialist"],
  fashion: ["creative professional", "model-like street casting", "stylist", "fashion student"],
  beauty: ["beauty customer", "makeup artist", "wellness professional", "salon owner"],
  sports: ["amateur athlete", "coach", "fitness instructor", "sports fan"],
  family: ["parent", "grandparent", "young adult", "caregiver"],
  luxury: ["art collector", "executive", "boutique owner", "affluent traveler"],
  local_business: ["shop owner", "restaurant worker", "craftsperson", "local customer"]
};
