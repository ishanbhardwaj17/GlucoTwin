from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from gluco_twin.config import settings
from gluco_twin.service.db import get_db, Patient, Timeseries, TwinState
from gluco_twin.service.schemas import (
    Health, PatientSummary, PatientDetail, TimeseriesResponse, TimeseriesPoint
)

app = FastAPI(
    title="GlucoTwin API",
    version="0.1.0",
    description="Digital Twin Backend for Predictive Glycemic Control"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=Health, tags=["System"])
def get_health() -> Health:
    return Health(
        status="ok",
        model_version="0.1.0",
        database="ok",
        cache_entries=0
    )

@app.get("/api/v1/patients", response_model=List[PatientSummary], tags=["Patients"])
def list_patients(db: Session = Depends(get_db)):
    """Fetch all patients for the triage dashboard."""
    patients = db.query(Patient).all()
    results = []
    for p in patients:
        twin = p.twin_state
        results.append(PatientSummary(
            patient_id=p.patient_id,
            display_name=p.display_name,
            age=p.age,
            sex=p.sex,
            source=p.source,
            twin_status=twin.status if twin else "not_personalized",
            current_glucose_mgdl=120.0, # Placeholder for live replay logic
            trend="flat",
            risk="low",
            low_confidence=False
        ))
    return results

@app.get("/api/v1/patients/{patient_id}", response_model=PatientDetail, tags=["Patients"])
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """Get full static profile and twin state for a specific patient."""
    p = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    
    twin = p.twin_state
    return PatientDetail(
        patient_id=p.patient_id,
        display_name=p.display_name,
        age=p.age,
        sex=p.sex,
        source=p.source,
        bmi=p.bmi,
        systolic_bp=p.systolic_bp,
        years_since_dx=p.years_since_dx,
        family_history=bool(p.family_history),
        prs_z=p.prs_z,
        prs_is_synthetic=bool(p.prs_is_synthetic),
        timeline_start=p.timeline_start,
        timeline_end=p.timeline_end,
        twin={
            "status": twin.status if twin else "not_personalized",
            "days_of_data": twin.days_of_data if twin else 0.0,
            "fitted_at": twin.fitted_at,
            "rmse_before": twin.rmse_before,
            "rmse_after": twin.rmse_after
        },
        conditions=[{"code": c.code, "name": c.name, "onset_date": c.onset_date} for c in p.conditions],
        medications=[{"drug_class": m.drug_class, "drug_name": m.drug_name} for m in p.medications],
        labs=[{"code": l.code, "value": l.value, "unit": l.unit, "taken_at": l.taken_at} for l in p.lab_results]
    )
