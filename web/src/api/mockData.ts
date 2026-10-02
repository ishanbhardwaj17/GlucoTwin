import type {
  PatientSummary,
  PatientDetail,
  PredictResponse,
  ExplainResponse,
  ModelMetadata,
  WhatIfResponse,
  ForecastPoint,
  CGMDataPoint,
} from '@/types/schema';

// ─── Helpers ───────────────────────────────────────────────────────────────

const now = new Date();
const iso = (offsetMin: number) =>
  new Date(now.getTime() + offsetMin * 60000).toISOString();

// ─── Patients List ─────────────────────────────────────────────────────────

export const MOCK_PATIENTS: PatientSummary[] = [
  {
    id: 'syn_0042',
    name: 'Anjali Mehta',
    age: 54,
    sex: 'F',
    diabetes_type: 'T2D',
    risk_severity: 'high',
    twin_status: 'personalized',
    current_glucose_mgdl: 198,
    trend: 'rising',
    spike_probability: 0.84,
    estimated_minutes_to_event: 75,
    last_reading_at: iso(-3),
    confidence_score: 0.91,
  },
  {
    id: 'syn_0017',
    name: 'Ramesh Nair',
    age: 61,
    sex: 'M',
    diabetes_type: 'T2D',
    risk_severity: 'moderate',
    twin_status: 'personalized',
    current_glucose_mgdl: 162,
    trend: 'flat',
    spike_probability: 0.43,
    estimated_minutes_to_event: null,
    last_reading_at: iso(-5),
    confidence_score: 0.88,
  },
  {
    id: 'syn_0008',
    name: 'Priya Sharma',
    age: 47,
    sex: 'F',
    diabetes_type: 'T2D',
    risk_severity: 'low',
    twin_status: 'collecting',
    current_glucose_mgdl: 134,
    trend: 'falling',
    spike_probability: 0.12,
    estimated_minutes_to_event: null,
    last_reading_at: iso(-2),
    confidence_score: 0.74,
  },
  {
    id: 'syn_0099',
    name: 'Vikram Joshi',
    age: 68,
    sex: 'M',
    diabetes_type: 'T2D',
    risk_severity: 'moderate',
    twin_status: 'stale',
    current_glucose_mgdl: 155,
    trend: 'flat',
    spike_probability: 0.38,
    estimated_minutes_to_event: null,
    last_reading_at: iso(-62),
    confidence_score: 0.31, // sensor dropout
  },
];

// ─── Patient Detail ───────────────────────────────────────────────────────

export const MOCK_PATIENT_DETAILS: Record<string, PatientDetail> = {
  syn_0042: {
    ...MOCK_PATIENTS[0],
    vitals: { weight_kg: 72.4, height_cm: 161, bmi: 27.9, sbp_mmhg: 138, dbp_mmhg: 86, heart_rate_bpm: 79 },
    labs: {
      hba1c_pct: 8.1, fasting_glucose_mgdl: 168, egfr_ml_min: 72,
      ldl_mgdl: 118, hdl_mgdl: 48, triglycerides_mgdl: 196,
      last_updated: iso(-2 * 24 * 60),
    },
    active_conditions: ['Type 2 Diabetes Mellitus', 'Hypertension', 'Dyslipidaemia', 'Obesity (Class I)'],
    current_medications: ['Metformin 1000mg BD', 'Sitagliptin 100mg OD', 'Amlodipine 5mg OD', 'Rosuvastatin 10mg OD'],
    data_completeness: { cgm_pct: 96, hr_pct: 88, sleep_pct: 72, activity_pct: 81, overall_pct: 87 },
    clinician: 'Dr. Arun Gupta, Endocrinology',
    diagnose_date: '2019-06-12',
    target_range: { low: 70, high: 180 },
  },
  syn_0017: {
    ...MOCK_PATIENTS[1],
    vitals: { weight_kg: 88.1, height_cm: 174, bmi: 29.1, sbp_mmhg: 142, dbp_mmhg: 90, heart_rate_bpm: 72 },
    labs: {
      hba1c_pct: 7.4, fasting_glucose_mgdl: 142, egfr_ml_min: 58,
      ldl_mgdl: 102, hdl_mgdl: 42, triglycerides_mgdl: 211,
      last_updated: iso(-5 * 24 * 60),
    },
    active_conditions: ['Type 2 Diabetes Mellitus', 'Chronic Kidney Disease (Stage 3a)', 'Hypertension'],
    current_medications: ['Empagliflozin 10mg OD', 'Insulin Glargine 18U nocte', 'Ramipril 5mg OD'],
    data_completeness: { cgm_pct: 91, hr_pct: 83, sleep_pct: 65, activity_pct: 78, overall_pct: 81 },
    clinician: 'Dr. Meena Krishnan, Nephrology-Diabetes',
    diagnose_date: '2016-02-28',
    target_range: { low: 70, high: 180 },
  },
  syn_0008: {
    ...MOCK_PATIENTS[2],
    vitals: { weight_kg: 63.5, height_cm: 158, bmi: 25.4, sbp_mmhg: 126, dbp_mmhg: 78, heart_rate_bpm: 68 },
    labs: {
      hba1c_pct: 6.9, fasting_glucose_mgdl: 128, egfr_ml_min: 91,
      ldl_mgdl: 96, hdl_mgdl: 55, triglycerides_mgdl: 148,
      last_updated: iso(-7 * 24 * 60),
    },
    active_conditions: ['Type 2 Diabetes Mellitus (newly diagnosed)', 'Pre-hypertension'],
    current_medications: ['Metformin 500mg BD', 'Lifestyle modification programme'],
    data_completeness: { cgm_pct: 74, hr_pct: 62, sleep_pct: 44, activity_pct: 59, overall_pct: 62 },
    clinician: 'Dr. Lakshmi Iyer, General Medicine',
    diagnose_date: '2024-11-05',
    target_range: { low: 70, high: 180 },
  },
  syn_0099: {
    ...MOCK_PATIENTS[3],
    vitals: { weight_kg: 91.2, height_cm: 170, bmi: 31.5, sbp_mmhg: 148, dbp_mmhg: 94, heart_rate_bpm: 84 },
    labs: {
      hba1c_pct: 8.6, fasting_glucose_mgdl: 176, egfr_ml_min: 44,
      ldl_mgdl: 134, hdl_mgdl: 38, triglycerides_mgdl: 288,
      last_updated: iso(-10 * 24 * 60),
    },
    active_conditions: ['Type 2 Diabetes Mellitus', 'CKD Stage 3b', 'Hypertension', 'NAFLD'],
    current_medications: ['Insulin Glargine 30U nocte', 'Insulin Lispro 8U TDS', 'Furosemide 40mg OD', 'Losartan 50mg OD'],
    data_completeness: { cgm_pct: 38, hr_pct: 22, sleep_pct: 18, activity_pct: 15, overall_pct: 26 },
    clinician: 'Dr. Sanjay Verma, Internal Medicine',
    diagnose_date: '2012-08-19',
    target_range: { low: 80, high: 200 },
  },
};

// ─── CGM History Generator ────────────────────────────────────────────────

function generateHistory(
  baseGlucose: number,
  trend: 'rising' | 'flat' | 'falling',
  points = 32
): CGMDataPoint[] {
  const data: CGMDataPoint[] = [];
  let val = baseGlucose - (trend === 'rising' ? 50 : trend === 'falling' ? -20 : 10);

  for (let i = 0; i < points; i++) {
    const ts = now.getTime() - (points - i) * 15 * 60 * 1000;
    const noise = (Math.random() - 0.5) * 8;
    const trendDelta = trend === 'rising' ? 1.6 : trend === 'falling' ? -1.2 : 0.2;
    val = Math.max(60, Math.min(350, val + trendDelta * 15 + noise));
    data.push({
      time: new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      timestamp: ts,
      glucose: Math.round(val),
    });
  }
  return data;
}

// ─── Forecast Generator ───────────────────────────────────────────────────

function generateForecast(
  currentGlucose: number,
  trend: 'rising' | 'flat' | 'falling',
  peakAt = 60
): ForecastPoint[] {
  const offsets = [15, 30, 45, 60, 75, 90, 105, 120];
  return offsets.map((offset) => {
    const factor = offset <= peakAt
      ? offset / peakAt
      : 1 - (offset - peakAt) / (120 - peakAt);
    const delta = trend === 'rising' ? 60 : trend === 'falling' ? -20 : 15;
    const p50 = Math.round(currentGlucose + delta * factor);
    const spread = 10 + offset * 0.3;
    return { offset_min: offset, p50, p10: Math.round(p50 - spread), p90: Math.round(p50 + spread) };
  });
}

// ─── Predict Responses ────────────────────────────────────────────────────

export const MODEL_METADATA: ModelMetadata = {
  model_version: 'GlucoTwin-v3.4.1',
  retrained_at: iso(-4 * 60),
  auroc: 0.86,
  mae_mgdl: 10.3,
  mard_pct: 7.2,
  lead_time_avg_min: 72,
  accuracy_within_30: 94.6,
};

export const MOCK_PREDICTIONS: Record<string, PredictResponse> = {
  syn_0042: {
    patient_id: 'syn_0042',
    generated_at: now.toISOString(),
    forecast: generateForecast(198, 'rising', 60),
    event_risk: { probability: 0.84, severity: 'high', estimated_minutes_to_event: 75, peak_predicted_mgdl: 244 },
    data_quality: { cgm_coverage_pct: 96, hr_coverage_pct: 88, sensor_dropout: false, imputed_points: 2 },
    model_metadata: MODEL_METADATA,
  },
  syn_0017: {
    patient_id: 'syn_0017',
    generated_at: now.toISOString(),
    forecast: generateForecast(162, 'flat', 45),
    event_risk: { probability: 0.43, severity: 'moderate', estimated_minutes_to_event: null, peak_predicted_mgdl: 192 },
    data_quality: { cgm_coverage_pct: 91, hr_coverage_pct: 83, sensor_dropout: false, imputed_points: 5 },
    model_metadata: MODEL_METADATA,
  },
  syn_0008: {
    patient_id: 'syn_0008',
    generated_at: now.toISOString(),
    forecast: generateForecast(134, 'falling', 30),
    event_risk: { probability: 0.12, severity: 'low', estimated_minutes_to_event: null, peak_predicted_mgdl: 148 },
    data_quality: { cgm_coverage_pct: 74, hr_coverage_pct: 62, sensor_dropout: false, imputed_points: 8 },
    model_metadata: MODEL_METADATA,
  },
  syn_0099: {
    patient_id: 'syn_0099',
    generated_at: now.toISOString(),
    forecast: generateForecast(155, 'flat', 60),
    event_risk: { probability: 0.38, severity: 'moderate', estimated_minutes_to_event: null, peak_predicted_mgdl: 188 },
    data_quality: { cgm_coverage_pct: 38, hr_coverage_pct: 22, sensor_dropout: true, imputed_points: 41 },
    model_metadata: MODEL_METADATA,
  },
};

export const MOCK_HISTORIES: Record<string, CGMDataPoint[]> = {
  syn_0042: generateHistory(198, 'rising'),
  syn_0017: generateHistory(162, 'flat'),
  syn_0008: generateHistory(134, 'falling'),
  syn_0099: generateHistory(155, 'flat'),
};

// ─── Explain Response ─────────────────────────────────────────────────────

export const MOCK_EXPLANATIONS: Record<string, ExplainResponse> = {
  syn_0042: {
    patient_id: 'syn_0042',
    attributions: [
      { feature: 'Glucose Δ (last 30 min)', share_pct: 31, direction: 'raises', plain_text: 'Glucose has been rising at 1.8 mg/dL/min over the past 30 minutes.' },
      { feature: 'Carbohydrate load', share_pct: 24, direction: 'raises', plain_text: 'High-GI breakfast (68g carbs) consumed 90 minutes ago is still active.' },
      { feature: 'Dawn phenomenon', share_pct: 13, direction: 'raises', plain_text: 'Cortisol-driven early-morning glucose elevation detected.' },
      { feature: 'Insulin on board (IOB)', share_pct: 11, direction: 'lowers', plain_text: 'Residual rapid-acting insulin from morning dose partially offsetting rise.' },
      { feature: 'Time since last meal', share_pct: 10, direction: 'raises', plain_text: 'Peak post-prandial window (90–120 min) is currently active.' },
      { feature: 'Circadian pattern', share_pct: 7, direction: 'raises', plain_text: 'Historical data shows higher glucose variability in this time window.' },
      { feature: 'Activity level', share_pct: 4, direction: 'lowers', plain_text: 'Light activity logged this morning provides minor attenuation.' },
    ],
    summary: 'The primary driver of the predicted spike is a combination of active post-prandial hyperglycaemia from breakfast and the patient\'s characteristic dawn phenomenon. Insulin on board partially mitigates risk but is insufficient to prevent exceedance of the 180 mg/dL threshold.',
    confidence: 0.87,
  },
  syn_0017: {
    patient_id: 'syn_0017',
    attributions: [
      { feature: 'Stable glucose trend', share_pct: 38, direction: 'lowers', plain_text: 'Glucose has been flat for the last 45 minutes.' },
      { feature: 'Empagliflozin effect', share_pct: 22, direction: 'lowers', plain_text: 'SGLT2 inhibitor active — estimated glucosuria of 65g/day.' },
      { feature: 'Residual meal effect', share_pct: 18, direction: 'raises', plain_text: 'Lunch carbohydrates still partially undigested.' },
      { feature: 'CKD adjustment', share_pct: 12, direction: 'raises', plain_text: 'Reduced renal clearance slightly attenuates drug effect.' },
      { feature: 'Circadian pattern', share_pct: 10, direction: 'raises', plain_text: 'Post-lunch afternoon pattern shows mild upward tendency.' },
    ],
    summary: 'Moderate risk driven by residual meal effects partially countered by strong empagliflozin response. CKD stage 3a reduces drug efficacy slightly.',
    confidence: 0.71,
  },
  syn_0008: {
    patient_id: 'syn_0008',
    attributions: [
      { feature: 'Low baseline HbA1c', share_pct: 35, direction: 'lowers', plain_text: 'Well-controlled baseline glycaemia reduces overall spike risk.' },
      { feature: 'Falling glucose trend', share_pct: 28, direction: 'lowers', plain_text: 'Glucose actively declining at 0.9 mg/dL/min.' },
      { feature: 'Metformin steady-state', share_pct: 20, direction: 'lowers', plain_text: 'Hepatic glucose output effectively suppressed.' },
      { feature: 'Meal timing', share_pct: 17, direction: 'raises', plain_text: 'Next meal expected within 2 hours may cause moderate rise.' },
    ],
    summary: 'Low risk profile with actively falling glucose. Primary concern is pre-meal hypoglycaemia risk rather than hyperglycaemia.',
    confidence: 0.74,
  },
  syn_0099: {
    patient_id: 'syn_0099',
    attributions: [
      { feature: 'Sensor dropout (62%)', share_pct: 45, direction: 'raises', plain_text: 'Majority of CGM data is missing — model is heavily imputing.' },
      { feature: 'High HbA1c baseline', share_pct: 25, direction: 'raises', plain_text: 'HbA1c of 8.6% indicates chronically elevated glucose.' },
      { feature: 'Insulin dose adequacy', share_pct: 18, direction: 'lowers', plain_text: 'High insulin doses provide some protection.' },
      { feature: 'CKD stage 3b', share_pct: 12, direction: 'raises', plain_text: 'Reduced clearance prolongs hyperglycaemic episodes.' },
    ],
    summary: 'WARNING: Low confidence prediction due to sensor dropout (62% data missing). Results should be interpreted with extreme caution. Physical assessment recommended.',
    confidence: 0.31,
  },
};

// ─── What-If Baseline ─────────────────────────────────────────────────────

export function computeWhatIf(
  patientId: string,
  carbsG: number,
  walkMin: number,
  stressLevel: 'none' | 'mild' | 'high'
): WhatIfResponse {
  const pred = MOCK_PREDICTIONS[patientId];
  const basePeak = pred?.event_risk.peak_predicted_mgdl ?? 200;
  const baseProb = pred?.event_risk.probability ?? 0.5;

  const carbEffect = carbsG * 0.8;
  const walkEffect = walkMin * 1.2;
  const stressEffect = stressLevel === 'high' ? 20 : stressLevel === 'mild' ? 8 : 0;

  const scenarioPeak = Math.max(70, Math.round(basePeak + carbEffect - walkEffect + stressEffect));
  const scenarioProb = Math.min(1, Math.max(0, baseProb + carbsG * 0.003 - walkMin * 0.004 + (stressLevel === 'high' ? 0.1 : 0)));

  const baseMinAbove180 = basePeak > 180 ? 30 : 0;
  const scenarioMinAbove180 = scenarioPeak > 180 ? Math.round(baseMinAbove180 + carbsG * 0.4 - walkMin * 0.5) : 0;

  return {
    baseline: { peak_mgdl: basePeak, spike_probability: baseProb, minutes_above_180: baseMinAbove180 },
    scenario: { peak_mgdl: scenarioPeak, spike_probability: parseFloat(scenarioProb.toFixed(2)), minutes_above_180: Math.max(0, scenarioMinAbove180) },
    delta: {
      peak_mgdl: scenarioPeak - basePeak,
      spike_probability: parseFloat((scenarioProb - baseProb).toFixed(2)),
      minutes_above_180: Math.max(0, scenarioMinAbove180) - baseMinAbove180,
    },
    forecast_scenario: generateForecast(pred?.forecast[0]?.p50 ?? 180, 'rising', 45),
  };
}
