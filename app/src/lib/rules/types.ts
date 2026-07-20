export type Flag = "low" | "high" | "normal" | null;

export type Severity = "info" | "monitor" | "flag";

export interface ProtocolEntry {
  compoundName: string;
  category: string;
  doseValue: number;
  doseUnit: string;
}

export interface LabResultInput {
  code: string;
  name: string;
  value: number;
  unit: string;
  flag: Flag;
  rangeLow?: number | null;
  rangeHigh?: number | null;
}

export interface Insight {
  id: string;
  biomarkerCode: string;
  biomarkerName: string;
  severity: Severity;
  summary: string;
  context: string[];
  relatedCompounds: string[];
}
