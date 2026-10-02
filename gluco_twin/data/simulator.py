import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def estimate_basal_glucose(hba1c: float) -> float:
    """Estimated Average Glucose (eAG) in mg/dL from HbA1c percentage."""
    return 28.7 * hba1c - 46.7

def simulate_patient_stream(
    patient_id: str,
    hba1c: float,
    bmi: float,
    start_time: datetime,
    days: int = 14,
    grid_minutes: int = 15,
    seed: int = 42
) -> pd.DataFrame:
    """
    Simulates dynamic physiological time-series (CGM, HR, steps, sleep, carbs)
    on a canonical grid based on the patient's static EHR parameters.
    """
    np.random.seed(seed)
    total_steps = int((days * 24 * 60) / grid_minutes)
    timestamps = [start_time + timedelta(minutes=i * grid_minutes) for i in range(total_steps)]

    # Basal target and baseline insulin sensitivity
    g_base = estimate_basal_glucose(hba1c)
    base_sensitivity = max(0.45, 1.4 - (bmi / 65.0) - (hba1c / 22.0))

    glucose_readings = []
    hr_readings = []
    step_counts = []
    sleep_stages = []
    carbs_logged = []

    current_g = g_base

    for ts in timestamps:
        hour = ts.hour + ts.minute / 60.0

        # 1. Sleep stage and nocturnal vitals (23:00 to 07:00)
        is_sleeping = hour >= 23.0 or hour < 7.0
        if is_sleeping:
            stage = np.random.choice(["light", "deep", "rem", "awake"], p=[0.50, 0.25, 0.20, 0.05])
            hr = float(np.random.normal(58.0 + (bmi * 0.2), 3.0))
            steps = 0
            sleep_penalty = 0.85 if stage in ("light", "awake") else 1.0
        else:
            stage = "awake"
            hr = float(np.random.normal(74.0 + (bmi * 0.2), 5.5))
            steps = int(np.random.choice([0, 60, 180, 420], p=[0.45, 0.30, 0.15, 0.10]))
            sleep_penalty = 1.0

        # 2. Meal simulation
        carbs = 0.0
        if ts.minute == 0:
            if ts.hour == 8:
                carbs = float(np.random.uniform(35.0, 65.0))
            elif ts.hour == 13:
                carbs = float(np.random.uniform(55.0, 95.0))
            elif ts.hour == 17 and np.random.rand() > 0.5:
                carbs = float(np.random.uniform(15.0, 30.0))
            elif ts.hour == 20:
                carbs = float(np.random.uniform(60.0, 110.0))

        # 3. Dynamic glucose differential response
        dawn_bump = 14.0 if (4.0 <= hour <= 7.0) else 0.0
        exercise_burn = (steps / 100.0) * 1.6
        meal_effect = (carbs * 1.75) * (1.25 - base_sensitivity * sleep_penalty)

        # Decay towards baseline with stochastic sensor noise
        current_g += -0.12 * (current_g - (g_base + dawn_bump)) + meal_effect - exercise_burn
        current_g += np.random.normal(0.0, 2.0)
        current_g = float(np.clip(current_g, 45.0, 450.0))

        glucose_readings.append(round(current_g, 1))
        hr_readings.append(round(hr, 1))
        step_counts.append(steps)
        sleep_stages.append(stage if is_sleeping else None)
        carbs_logged.append(round(carbs, 1))

    return pd.DataFrame({
        "patient_id": patient_id,
        "ts": [ts.isoformat() for ts in timestamps],
        "glucose_mgdl": glucose_readings,
        "glucose_interpolated": 0,
        "hr_bpm": hr_readings,
        "steps": step_counts,
        "sleep_stage": sleep_stages,
        "carbs_g": carbs_logged
    })
