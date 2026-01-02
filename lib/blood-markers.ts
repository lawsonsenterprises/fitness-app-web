/**
 * Standard blood marker definitions with reference ranges
 * Reference ranges are based on typical adult values - individual labs may vary
 */

export interface BloodMarkerDefinition {
  name: string
  code: string
  unit: string
  category: string
  refLow: number
  refHigh: number
  description?: string
}

export const BLOOD_MARKER_DEFINITIONS: BloodMarkerDefinition[] = [
  // Hormones
  { name: 'Testosterone', code: 'testosterone', unit: 'nmol/L', category: 'Hormones', refLow: 8.64, refHigh: 29, description: 'Primary male sex hormone' },
  { name: 'Free Testosterone', code: 'free_testosterone', unit: 'nmol/L', category: 'Hormones', refLow: 0.2, refHigh: 0.62 },
  { name: 'SHBG', code: 'shbg', unit: 'nmol/L', category: 'Hormones', refLow: 18.3, refHigh: 54.1, description: 'Sex Hormone Binding Globulin' },
  { name: 'Oestradiol', code: 'oestradiol', unit: 'pmol/L', category: 'Hormones', refLow: 41, refHigh: 159, description: 'Primary female sex hormone' },
  { name: 'Prolactin', code: 'prolactin', unit: 'mU/L', category: 'Hormones', refLow: 86, refHigh: 324 },
  { name: 'LH', code: 'lh', unit: 'IU/L', category: 'Hormones', refLow: 1.7, refHigh: 8.6, description: 'Luteinizing Hormone' },
  { name: 'FSH', code: 'fsh', unit: 'IU/L', category: 'Hormones', refLow: 1.5, refHigh: 12.4, description: 'Follicle Stimulating Hormone' },
  { name: 'Cortisol', code: 'cortisol', unit: 'nmol/L', category: 'Hormones', refLow: 166, refHigh: 507, description: 'Stress hormone' },
  { name: 'DHEA-S', code: 'dhea_s', unit: 'umol/L', category: 'Hormones', refLow: 2.4, refHigh: 11.6 },
  { name: 'IGF-1', code: 'igf1', unit: 'nmol/L', category: 'Hormones', refLow: 13, refHigh: 40, description: 'Insulin-like Growth Factor 1' },

  // Thyroid
  { name: 'TSH', code: 'tsh', unit: 'mU/L', category: 'Thyroid', refLow: 0.27, refHigh: 4.2, description: 'Thyroid Stimulating Hormone' },
  { name: 'Free T4', code: 'free_t4', unit: 'pmol/L', category: 'Thyroid', refLow: 12, refHigh: 22, description: 'Free Thyroxine' },
  { name: 'Free T3', code: 'free_t3', unit: 'pmol/L', category: 'Thyroid', refLow: 3.1, refHigh: 6.8, description: 'Free Triiodothyronine' },
  { name: 'Total T4', code: 'total_t4', unit: 'nmol/L', category: 'Thyroid', refLow: 66, refHigh: 181 },
  { name: 'Total T3', code: 'total_t3', unit: 'nmol/L', category: 'Thyroid', refLow: 1.3, refHigh: 3.1 },
  { name: 'Thyroglobulin', code: 'thyroglobulin', unit: 'ug/L', category: 'Thyroid', refLow: 0, refHigh: 55 },

  // Vitamins & Minerals
  { name: 'Vitamin D', code: 'vitamin_d', unit: 'nmol/L', category: 'Vitamins & Minerals', refLow: 50, refHigh: 175, description: '25-hydroxy Vitamin D' },
  { name: 'Vitamin B12', code: 'vitamin_b12', unit: 'pmol/L', category: 'Vitamins & Minerals', refLow: 140, refHigh: 724 },
  { name: 'Folate', code: 'folate', unit: 'nmol/L', category: 'Vitamins & Minerals', refLow: 8.83, refHigh: 60.8 },
  { name: 'Ferritin', code: 'ferritin', unit: 'ug/L', category: 'Vitamins & Minerals', refLow: 30, refHigh: 400, description: 'Iron storage protein' },
  { name: 'Iron', code: 'iron', unit: 'umol/L', category: 'Vitamins & Minerals', refLow: 10, refHigh: 30 },
  { name: 'TIBC', code: 'tibc', unit: 'umol/L', category: 'Vitamins & Minerals', refLow: 45, refHigh: 72, description: 'Total Iron Binding Capacity' },
  { name: 'Transferrin Saturation', code: 'transferrin_saturation', unit: '%', category: 'Vitamins & Minerals', refLow: 20, refHigh: 50 },
  { name: 'Magnesium', code: 'magnesium', unit: 'mmol/L', category: 'Vitamins & Minerals', refLow: 0.7, refHigh: 1.0 },
  { name: 'Zinc', code: 'zinc', unit: 'umol/L', category: 'Vitamins & Minerals', refLow: 11, refHigh: 24 },
  { name: 'Copper', code: 'copper', unit: 'umol/L', category: 'Vitamins & Minerals', refLow: 12, refHigh: 20 },
  { name: 'Selenium', code: 'selenium', unit: 'umol/L', category: 'Vitamins & Minerals', refLow: 0.89, refHigh: 1.65 },

  // Lipids
  { name: 'Total Cholesterol', code: 'total_cholesterol', unit: 'mmol/L', category: 'Lipids', refLow: 0, refHigh: 5 },
  { name: 'LDL Cholesterol', code: 'ldl_cholesterol', unit: 'mmol/L', category: 'Lipids', refLow: 0, refHigh: 3, description: 'Low-density lipoprotein' },
  { name: 'HDL Cholesterol', code: 'hdl_cholesterol', unit: 'mmol/L', category: 'Lipids', refLow: 1, refHigh: 2.1, description: 'High-density lipoprotein' },
  { name: 'Triglycerides', code: 'triglycerides', unit: 'mmol/L', category: 'Lipids', refLow: 0, refHigh: 1.7 },
  { name: 'Non-HDL Cholesterol', code: 'non_hdl_cholesterol', unit: 'mmol/L', category: 'Lipids', refLow: 0, refHigh: 4 },
  { name: 'Apolipoprotein A1', code: 'apo_a1', unit: 'g/L', category: 'Lipids', refLow: 1.2, refHigh: 1.8 },
  { name: 'Apolipoprotein B', code: 'apo_b', unit: 'g/L', category: 'Lipids', refLow: 0.5, refHigh: 1.0 },
  { name: 'Lipoprotein(a)', code: 'lp_a', unit: 'nmol/L', category: 'Lipids', refLow: 0, refHigh: 75 },

  // Liver
  { name: 'ALT', code: 'alt', unit: 'U/L', category: 'Liver', refLow: 0, refHigh: 41, description: 'Alanine Aminotransferase' },
  { name: 'AST', code: 'ast', unit: 'U/L', category: 'Liver', refLow: 0, refHigh: 40, description: 'Aspartate Aminotransferase' },
  { name: 'GGT', code: 'ggt', unit: 'U/L', category: 'Liver', refLow: 0, refHigh: 60, description: 'Gamma-glutamyl Transferase' },
  { name: 'ALP', code: 'alp', unit: 'U/L', category: 'Liver', refLow: 30, refHigh: 130, description: 'Alkaline Phosphatase' },
  { name: 'Bilirubin', code: 'bilirubin', unit: 'umol/L', category: 'Liver', refLow: 0, refHigh: 21 },
  { name: 'Albumin', code: 'albumin', unit: 'g/L', category: 'Liver', refLow: 35, refHigh: 50 },
  { name: 'Total Protein', code: 'total_protein', unit: 'g/L', category: 'Liver', refLow: 60, refHigh: 80 },
  { name: 'Globulin', code: 'globulin', unit: 'g/L', category: 'Liver', refLow: 20, refHigh: 35 },

  // Kidney
  { name: 'Creatinine', code: 'creatinine', unit: 'umol/L', category: 'Kidney', refLow: 59, refHigh: 104 },
  { name: 'Urea', code: 'urea', unit: 'mmol/L', category: 'Kidney', refLow: 2.5, refHigh: 7.8 },
  { name: 'eGFR', code: 'egfr', unit: 'mL/min/1.73m²', category: 'Kidney', refLow: 90, refHigh: 120, description: 'Estimated Glomerular Filtration Rate' },
  { name: 'Uric Acid', code: 'uric_acid', unit: 'umol/L', category: 'Kidney', refLow: 200, refHigh: 430 },
  { name: 'Cystatin C', code: 'cystatin_c', unit: 'mg/L', category: 'Kidney', refLow: 0.62, refHigh: 1.11 },

  // Blood Count
  { name: 'Haemoglobin', code: 'haemoglobin', unit: 'g/L', category: 'Blood Count', refLow: 130, refHigh: 170 },
  { name: 'Haematocrit', code: 'haematocrit', unit: '%', category: 'Blood Count', refLow: 37, refHigh: 50 },
  { name: 'Red Blood Cells', code: 'rbc', unit: '10^12/L', category: 'Blood Count', refLow: 4.5, refHigh: 5.5 },
  { name: 'White Blood Cells', code: 'wbc', unit: '10^9/L', category: 'Blood Count', refLow: 4, refHigh: 11 },
  { name: 'Platelets', code: 'platelets', unit: '10^9/L', category: 'Blood Count', refLow: 150, refHigh: 400 },
  { name: 'MCV', code: 'mcv', unit: 'fL', category: 'Blood Count', refLow: 80, refHigh: 100, description: 'Mean Corpuscular Volume' },
  { name: 'MCH', code: 'mch', unit: 'pg', category: 'Blood Count', refLow: 27, refHigh: 32, description: 'Mean Corpuscular Haemoglobin' },
  { name: 'MCHC', code: 'mchc', unit: 'g/L', category: 'Blood Count', refLow: 320, refHigh: 360, description: 'Mean Corpuscular Haemoglobin Concentration' },
  { name: 'RDW', code: 'rdw', unit: '%', category: 'Blood Count', refLow: 11.5, refHigh: 14.5, description: 'Red Cell Distribution Width' },
  { name: 'Neutrophils', code: 'neutrophils', unit: '10^9/L', category: 'Blood Count', refLow: 2, refHigh: 7.5 },
  { name: 'Lymphocytes', code: 'lymphocytes', unit: '10^9/L', category: 'Blood Count', refLow: 1, refHigh: 4 },
  { name: 'Monocytes', code: 'monocytes', unit: '10^9/L', category: 'Blood Count', refLow: 0.2, refHigh: 1 },
  { name: 'Eosinophils', code: 'eosinophils', unit: '10^9/L', category: 'Blood Count', refLow: 0, refHigh: 0.5 },
  { name: 'Basophils', code: 'basophils', unit: '10^9/L', category: 'Blood Count', refLow: 0, refHigh: 0.1 },

  // Metabolic
  { name: 'Glucose', code: 'glucose', unit: 'mmol/L', category: 'Metabolic', refLow: 3.9, refHigh: 5.5, description: 'Fasting blood glucose' },
  { name: 'HbA1c', code: 'hba1c', unit: 'mmol/mol', category: 'Metabolic', refLow: 20, refHigh: 42, description: 'Glycated Haemoglobin' },
  { name: 'Insulin', code: 'insulin', unit: 'pmol/L', category: 'Metabolic', refLow: 18, refHigh: 173, description: 'Fasting insulin' },
  { name: 'HOMA-IR', code: 'homa_ir', unit: '', category: 'Metabolic', refLow: 0, refHigh: 2, description: 'Insulin Resistance Index' },
  { name: 'C-Peptide', code: 'c_peptide', unit: 'pmol/L', category: 'Metabolic', refLow: 370, refHigh: 1470 },

  // Inflammation
  { name: 'CRP', code: 'crp', unit: 'mg/L', category: 'Inflammation', refLow: 0, refHigh: 5, description: 'C-Reactive Protein' },
  { name: 'hs-CRP', code: 'hs_crp', unit: 'mg/L', category: 'Inflammation', refLow: 0, refHigh: 3, description: 'High-sensitivity CRP' },
  { name: 'ESR', code: 'esr', unit: 'mm/hr', category: 'Inflammation', refLow: 0, refHigh: 20, description: 'Erythrocyte Sedimentation Rate' },
  { name: 'Homocysteine', code: 'homocysteine', unit: 'umol/L', category: 'Inflammation', refLow: 0, refHigh: 15 },
  { name: 'Fibrinogen', code: 'fibrinogen', unit: 'g/L', category: 'Inflammation', refLow: 2, refHigh: 4 },

  // Cardiac
  { name: 'Troponin', code: 'troponin', unit: 'ng/L', category: 'Cardiac', refLow: 0, refHigh: 14 },
  { name: 'BNP', code: 'bnp', unit: 'pg/mL', category: 'Cardiac', refLow: 0, refHigh: 100, description: 'Brain Natriuretic Peptide' },
  { name: 'NT-proBNP', code: 'nt_probnp', unit: 'pg/mL', category: 'Cardiac', refLow: 0, refHigh: 125 },

  // Electrolytes
  { name: 'Sodium', code: 'sodium', unit: 'mmol/L', category: 'Electrolytes', refLow: 136, refHigh: 145 },
  { name: 'Potassium', code: 'potassium', unit: 'mmol/L', category: 'Electrolytes', refLow: 3.5, refHigh: 5.1 },
  { name: 'Chloride', code: 'chloride', unit: 'mmol/L', category: 'Electrolytes', refLow: 98, refHigh: 107 },
  { name: 'Bicarbonate', code: 'bicarbonate', unit: 'mmol/L', category: 'Electrolytes', refLow: 22, refHigh: 29 },
  { name: 'Calcium', code: 'calcium', unit: 'mmol/L', category: 'Electrolytes', refLow: 2.2, refHigh: 2.6 },
  { name: 'Phosphate', code: 'phosphate', unit: 'mmol/L', category: 'Electrolytes', refLow: 0.8, refHigh: 1.5 },

  // Other
  { name: 'PSA', code: 'psa', unit: 'ug/L', category: 'Other', refLow: 0, refHigh: 4, description: 'Prostate Specific Antigen' },
  { name: 'Lactate', code: 'lactate', unit: 'mmol/L', category: 'Other', refLow: 0.5, refHigh: 2.2 },
  { name: 'Ammonia', code: 'ammonia', unit: 'umol/L', category: 'Other', refLow: 16, refHigh: 60 },
]

/**
 * Look up reference ranges for a marker by name or code
 * Returns null if no match found
 */
export function getMarkerReferenceRanges(nameOrCode: string | null | undefined): { low: number; high: number } | null {
  if (!nameOrCode) return null

  const normalised = nameOrCode.toLowerCase().replace(/[\s-]+/g, '_')

  const marker = BLOOD_MARKER_DEFINITIONS.find(
    m => m.code === normalised ||
         m.name.toLowerCase() === nameOrCode.toLowerCase() ||
         m.name.toLowerCase().replace(/[\s-]+/g, '_') === normalised
  )

  if (marker) {
    return { low: marker.refLow, high: marker.refHigh }
  }

  return null
}

/**
 * Get marker definition by name or code
 */
export function getMarkerDefinition(nameOrCode: string): BloodMarkerDefinition | null {
  const normalised = nameOrCode.toLowerCase().replace(/[\s-]+/g, '_')

  return BLOOD_MARKER_DEFINITIONS.find(
    m => m.code === normalised ||
         m.name.toLowerCase() === nameOrCode.toLowerCase() ||
         m.name.toLowerCase().replace(/[\s-]+/g, '_') === normalised
  ) || null
}

/**
 * Get all markers for a category
 */
export function getMarkersByCategory(category: string): BloodMarkerDefinition[] {
  return BLOOD_MARKER_DEFINITIONS.filter(m => m.category === category)
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  return [...new Set(BLOOD_MARKER_DEFINITIONS.map(m => m.category))]
}
