import { PrismaClient, CompoundCategory } from "@prisma/client";

const prisma = new PrismaClient();

const compounds: {
  name: string;
  category: CompoundCategory;
  defaultUnit: string;
  notes?: string;
}[] = [
  // Injectable AAS
  { name: "Testosterone Cypionate", category: "AAS_INJECTABLE", defaultUnit: "mg/week" },
  { name: "Testosterone Enanthate", category: "AAS_INJECTABLE", defaultUnit: "mg/week" },
  { name: "Testosterone Propionate", category: "AAS_INJECTABLE", defaultUnit: "mg/week" },
  { name: "Nandrolone Decanoate", category: "AAS_INJECTABLE", defaultUnit: "mg/week", notes: "Deca" },
  { name: "Nandrolone Phenylpropionate", category: "AAS_INJECTABLE", defaultUnit: "mg/week", notes: "NPP" },
  { name: "Boldenone Undecylenate", category: "AAS_INJECTABLE", defaultUnit: "mg/week", notes: "EQ" },
  { name: "Drostanolone Propionate", category: "AAS_INJECTABLE", defaultUnit: "mg/week", notes: "Masteron" },
  { name: "Trenbolone Acetate", category: "AAS_INJECTABLE", defaultUnit: "mg/week" },
  { name: "Methenolone Enanthate", category: "AAS_INJECTABLE", defaultUnit: "mg/week", notes: "Primobolan" },
  // Oral AAS
  { name: "Oxandrolone", category: "AAS_ORAL", defaultUnit: "mg/day", notes: "Anavar" },
  { name: "Methandrostenolone", category: "AAS_ORAL", defaultUnit: "mg/day", notes: "Dianabol" },
  { name: "Stanozolol", category: "AAS_ORAL", defaultUnit: "mg/day", notes: "Winstrol" },
  { name: "Methenolone Acetate", category: "AAS_ORAL", defaultUnit: "mg/day", notes: "Primobolan (oral)" },
  // SARMs
  { name: "Ostarine (MK-2866)", category: "SARM", defaultUnit: "mg/day" },
  { name: "RAD-140", category: "SARM", defaultUnit: "mg/day" },
  { name: "LGD-4033", category: "SARM", defaultUnit: "mg/day" },
  // Peptides
  { name: "BPC-157", category: "PEPTIDE", defaultUnit: "mcg/day" },
  { name: "TB-500", category: "PEPTIDE", defaultUnit: "mg/week" },
  { name: "CJC-1295", category: "PEPTIDE", defaultUnit: "mcg/day" },
  { name: "Ipamorelin", category: "PEPTIDE", defaultUnit: "mcg/day" },
  { name: "Retatrutide", category: "PEPTIDE", defaultUnit: "mg/week" },
  { name: "Semaglutide", category: "PEPTIDE", defaultUnit: "mg/week" },
  { name: "Tirzepatide", category: "PEPTIDE", defaultUnit: "mg/week" },
  { name: "HCG", category: "PEPTIDE", defaultUnit: "IU/week" },
  // HGH
  { name: "Somatropin (HGH)", category: "HGH", defaultUnit: "IU/day" },
  // Ancillaries / medications
  { name: "Anastrozole", category: "MEDICATION", defaultUnit: "mg/week", notes: "Aromatase inhibitor" },
  { name: "Enclomiphene", category: "MEDICATION", defaultUnit: "mg/day" },
  { name: "Finasteride", category: "MEDICATION", defaultUnit: "mg/day" },
  // Supplements
  { name: "Creatine Monohydrate", category: "SUPPLEMENT", defaultUnit: "g/day" },
];

const biomarkers: {
  code: string;
  name: string;
  unit: string;
  category: string;
  rangeLowMale?: number;
  rangeHighMale?: number;
  rangeLowFemale?: number;
  rangeHighFemale?: number;
  description: string;
}[] = [
  { code: "HCT", name: "Hematocrit", unit: "%", category: "CBC", rangeLowMale: 41, rangeHighMale: 50, rangeLowFemale: 36, rangeHighFemale: 46, description: "The percentage of blood volume made up of red blood cells. Reflects how thick/concentrated the blood is." },
  { code: "HGB", name: "Hemoglobin", unit: "g/dL", category: "CBC", rangeLowMale: 13.5, rangeHighMale: 17.5, rangeLowFemale: 12, rangeHighFemale: 15.5, description: "The oxygen-carrying protein in red blood cells." },
  { code: "RBC", name: "Red Blood Cell Count", unit: "M/uL", category: "CBC", rangeLowMale: 4.5, rangeHighMale: 5.9, rangeLowFemale: 4.1, rangeHighFemale: 5.1, description: "The number of red blood cells per volume of blood." },
  { code: "FERR", name: "Ferritin", unit: "ng/mL", category: "Iron", rangeLowMale: 24, rangeHighMale: 336, rangeLowFemale: 11, rangeHighFemale: 307, description: "A protein that stores iron; used to assess iron stores." },
  { code: "HDL", name: "HDL Cholesterol", unit: "mg/dL", category: "Lipid Panel", rangeLowMale: 40, rangeHighMale: 999, rangeLowFemale: 50, rangeHighFemale: 999, description: "\"Good\" cholesterol that helps clear other cholesterol from the bloodstream." },
  { code: "LDL", name: "LDL Cholesterol", unit: "mg/dL", category: "Lipid Panel", rangeLowMale: 0, rangeHighMale: 100, rangeLowFemale: 0, rangeHighFemale: 100, description: "\"Bad\" cholesterol; elevated levels are associated with cardiovascular risk." },
  { code: "TRIG", name: "Triglycerides", unit: "mg/dL", category: "Lipid Panel", rangeLowMale: 0, rangeHighMale: 150, rangeLowFemale: 0, rangeHighFemale: 150, description: "A type of fat in the blood, influenced by diet and metabolic health." },
  { code: "TC", name: "Total Cholesterol", unit: "mg/dL", category: "Lipid Panel", rangeLowMale: 0, rangeHighMale: 200, rangeLowFemale: 0, rangeHighFemale: 200, description: "The total amount of cholesterol in the blood." },
  { code: "ALT", name: "ALT (Alanine Aminotransferase)", unit: "U/L", category: "Liver", rangeLowMale: 7, rangeHighMale: 56, rangeLowFemale: 7, rangeHighFemale: 45, description: "A liver enzyme; elevated levels can indicate liver stress or damage." },
  { code: "AST", name: "AST (Aspartate Aminotransferase)", unit: "U/L", category: "Liver", rangeLowMale: 8, rangeHighMale: 48, rangeLowFemale: 8, rangeHighFemale: 43, description: "A liver/muscle enzyme; elevated levels can indicate liver stress, or muscle breakdown from intense training." },
  { code: "GGT", name: "GGT (Gamma-Glutamyl Transferase)", unit: "U/L", category: "Liver", rangeLowMale: 8, rangeHighMale: 61, rangeLowFemale: 5, rangeHighFemale: 36, description: "A liver enzyme sensitive to bile duct issues and some oral medications." },
  { code: "TT", name: "Total Testosterone", unit: "ng/dL", category: "Hormone", rangeLowMale: 264, rangeHighMale: 916, rangeLowFemale: 8, rangeHighFemale: 60, description: "The total amount of testosterone circulating in the blood." },
  { code: "FT", name: "Free Testosterone", unit: "pg/mL", category: "Hormone", rangeLowMale: 46, rangeHighMale: 224, rangeLowFemale: 0.3, rangeHighFemale: 1.9, description: "The unbound, biologically active portion of testosterone." },
  { code: "E2", name: "Estradiol", unit: "pg/mL", category: "Hormone", rangeLowMale: 10, rangeHighMale: 40, rangeLowFemale: 15, rangeHighFemale: 350, description: "A form of estrogen; in men it is partly produced from the aromatization of testosterone." },
  { code: "SHBG", name: "Sex Hormone Binding Globulin", unit: "nmol/L", category: "Hormone", rangeLowMale: 10, rangeHighMale: 57, rangeLowFemale: 18, rangeHighFemale: 144, description: "A protein that binds sex hormones, affecting how much is \"free\" and active." },
  { code: "LH", name: "Luteinizing Hormone", unit: "mIU/mL", category: "Hormone", rangeLowMale: 1.7, rangeHighMale: 8.6, rangeLowFemale: 1, rangeHighFemale: 95, description: "A pituitary hormone that signals the testes/ovaries to produce sex hormones." },
  { code: "FSH", name: "Follicle Stimulating Hormone", unit: "mIU/mL", category: "Hormone", rangeLowMale: 1.5, rangeHighMale: 12.4, rangeLowFemale: 1, rangeHighFemale: 130, description: "A pituitary hormone involved in reproductive function." },
  { code: "PRL", name: "Prolactin", unit: "ng/mL", category: "Hormone", rangeLowMale: 4, rangeHighMale: 15.2, rangeLowFemale: 4.8, rangeHighFemale: 23.3, description: "A pituitary hormone; can be affected by certain compounds and stress." },
  { code: "IGF1", name: "IGF-1", unit: "ng/mL", category: "Hormone", rangeLowMale: 88, rangeHighMale: 209, rangeLowFemale: 88, rangeHighFemale: 209, description: "Insulin-like growth factor 1; the main marker used to track growth hormone activity." },
  { code: "GLU", name: "Fasting Glucose", unit: "mg/dL", category: "Metabolic", rangeLowMale: 70, rangeHighMale: 99, rangeLowFemale: 70, rangeHighFemale: 99, description: "Blood sugar level after fasting; used to screen for insulin resistance and diabetes." },
  { code: "A1C", name: "Hemoglobin A1c", unit: "%", category: "Metabolic", rangeLowMale: 4, rangeHighMale: 5.6, rangeLowFemale: 4, rangeHighFemale: 5.6, description: "Reflects average blood sugar over the past ~3 months." },
  { code: "CREAT", name: "Creatinine", unit: "mg/dL", category: "Kidney", rangeLowMale: 0.74, rangeHighMale: 1.35, rangeLowFemale: 0.59, rangeHighFemale: 1.04, description: "A waste product filtered by the kidneys; used to estimate kidney function." },
  { code: "EGFR", name: "eGFR", unit: "mL/min/1.73m2", category: "Kidney", rangeLowMale: 90, rangeHighMale: 999, rangeLowFemale: 90, rangeHighFemale: 999, description: "Estimated glomerular filtration rate; an estimate of kidney filtering capacity." },
  { code: "PSA", name: "PSA (Prostate Specific Antigen)", unit: "ng/mL", category: "Hormone", rangeLowMale: 0, rangeHighMale: 4, description: "A marker used to monitor prostate health, relevant for men on testosterone/AAS." },
  { code: "TSH", name: "TSH", unit: "uIU/mL", category: "Thyroid", rangeLowMale: 0.4, rangeHighMale: 4.5, rangeLowFemale: 0.4, rangeHighFemale: 4.5, description: "Thyroid stimulating hormone; the primary screening marker for thyroid function." },
];

async function main() {
  for (const c of compounds) {
    await prisma.compound.upsert({
      where: { name: c.name },
      update: c,
      create: c,
    });
  }
  for (const b of biomarkers) {
    await prisma.biomarker.upsert({
      where: { code: b.code },
      update: b,
      create: b,
    });
  }
  console.log(`Seeded ${compounds.length} compounds and ${biomarkers.length} biomarkers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
