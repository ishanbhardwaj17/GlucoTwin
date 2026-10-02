from datetime import datetime
from sqlalchemy import (
    ForeignKey,
    String,
    Float,
    Integer,
    LargeBinary,
    DateTime,
    Index,
    UniqueConstraint
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class ModelVersion(Base):
    __tablename__ = "model_versions"

    version: Mapped[str] = mapped_column(String, primary_key=True)
    created_at: Mapped[str] = mapped_column(String, default=lambda: datetime.utcnow().isoformat())
    data_hash: Mapped[str] = mapped_column(String)
    config_json: Mapped[str] = mapped_column(String)
    metrics_json: Mapped[str] = mapped_column(String)
    alert_threshold: Mapped[float] = mapped_column(Float)
    is_current: Mapped[int] = mapped_column(Integer, default=0)

class Patient(Base):
    __tablename__ = "patients"

    patient_id: Mapped[str] = mapped_column(String, primary_key=True)
    display_name: Mapped[str] = mapped_column(String)
    source: Mapped[str] = mapped_column(String)
    source_dataset: Mapped[str | None] = mapped_column(String, nullable=True)
    age: Mapped[int] = mapped_column(Integer)
    sex: Mapped[str] = mapped_column(String)
    bmi: Mapped[float | None] = mapped_column(Float, nullable=True)
    systolic_bp: Mapped[float | None] = mapped_column(Float, nullable=True)
    years_since_dx: Mapped[float | None] = mapped_column(Float, nullable=True)
    family_history: Mapped[int | None] = mapped_column(Integer, nullable=True)
    prs_z: Mapped[float | None] = mapped_column(Float, nullable=True)
    prs_is_synthetic: Mapped[int] = mapped_column(Integer, default=1)
    timeline_start: Mapped[str] = mapped_column(String)
    timeline_end: Mapped[str] = mapped_column(String)
    created_at: Mapped[str] = mapped_column(String, default=lambda: datetime.utcnow().isoformat())

    twin_state: Mapped["TwinState"] = relationship(back_populates="patient", uselist=False, cascade="all, delete-orphan")
    conditions: Mapped[list["Condition"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    medications: Mapped[list["Medication"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    lab_results: Mapped[list["LabResult"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    timeseries: Mapped[list["Timeseries"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    predictions: Mapped[list["Prediction"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    alerts: Mapped[list["Alert"]] = relationship(back_populates="patient", cascade="all, delete-orphan")

class Condition(Base):
    __tablename__ = "conditions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.patient_id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    onset_date: Mapped[str | None] = mapped_column(String, nullable=True)

    patient: Mapped[Patient] = relationship(back_populates="conditions")

class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.patient_id", ondelete="CASCADE"), index=True)
    drug_class: Mapped[str] = mapped_column(String)
    drug_name: Mapped[str] = mapped_column(String)
    start_date: Mapped[str | None] = mapped_column(String, nullable=True)
    end_date: Mapped[str | None] = mapped_column(String, nullable=True)

    patient: Mapped[Patient] = relationship(back_populates="medications")

class LabResult(Base):
    __tablename__ = "lab_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.patient_id", ondelete="CASCADE"))
    code: Mapped[str] = mapped_column(String)
    value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String)
    taken_at: Mapped[str] = mapped_column(String)

    patient: Mapped[Patient] = relationship(back_populates="lab_results")

    __table_args__ = (
        Index("ix_labs_patient_code_time", "patient_id", "code", "taken_at"),
    )

class Timeseries(Base):
    __tablename__ = "timeseries"

    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.patient_id", ondelete="CASCADE"), primary_key=True)
    ts: Mapped[str] = mapped_column(String, primary_key=True)
    glucose_mgdl: Mapped[float | None] = mapped_column(Float, nullable=True)
    glucose_interpolated: Mapped[int] = mapped_column(Integer, default=0)
    hr_bpm: Mapped[float | None] = mapped_column(Float, nullable=True)
    steps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sleep_stage: Mapped[str | None] = mapped_column(String, nullable=True)
    carbs_g: Mapped[float] = mapped_column(Float, default=0.0)

    patient: Mapped[Patient] = relationship(back_populates="timeseries")

class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.patient_id", ondelete="CASCADE"))
    at: Mapped[str] = mapped_column(String)
    model_version: Mapped[str] = mapped_column(ForeignKey("model_versions.version"))
    personalized: Mapped[int] = mapped_column(Integer, default=0)
    raw_probability: Mapped[float] = mapped_column(Float)
    event_probability: Mapped[float] = mapped_column(Float)
    severity: Mapped[str] = mapped_column(String)
    low_confidence: Mapped[int] = mapped_column(Integer, default=0)
    est_minutes_to_event: Mapped[int | None] = mapped_column(Integer, nullable=True)
    forecast_json: Mapped[str] = mapped_column(String)
    created_at: Mapped[str] = mapped_column(String, default=lambda: datetime.utcnow().isoformat())

    patient: Mapped[Patient] = relationship(back_populates="predictions")

    __table_args__ = (
        UniqueConstraint("patient_id", "at", "model_version", "personalized", name="ux_predictions_key"),
    )

class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.patient_id", ondelete="CASCADE"))
    started_at: Mapped[str] = mapped_column(String, index=True)
    ended_at: Mapped[str | None] = mapped_column(String, nullable=True)
    severity: Mapped[str] = mapped_column(String)
    peak_probability: Mapped[float] = mapped_column(Float)
    event_onset_at: Mapped[str | None] = mapped_column(String, nullable=True)
    event_occurred: Mapped[int | None] = mapped_column(Integer, nullable=True)
    lead_time_min: Mapped[int | None] = mapped_column(Integer, nullable=True)

    patient: Mapped[Patient] = relationship(back_populates="alerts")

class TwinState(Base):
    __tablename__ = "twin_state"

    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.patient_id", ondelete="CASCADE"), primary_key=True)
    status: Mapped[str] = mapped_column(String, default="not_personalized")
    days_of_data: Mapped[float] = mapped_column(Float, default=0.0)
    adapter_blob: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    adapter_version: Mapped[str | None] = mapped_column(String, nullable=True)
    fitted_at: Mapped[str | None] = mapped_column(String, nullable=True)
    rmse_before: Mapped[float | None] = mapped_column(Float, nullable=True)
    rmse_after: Mapped[float | None] = mapped_column(Float, nullable=True)
    updated_at: Mapped[str] = mapped_column(String, default=lambda: datetime.utcnow().isoformat())

    patient: Mapped[Patient] = relationship(back_populates="twin_state")

class WhatIfRun(Base):
    __tablename__ = "whatif_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.patient_id", ondelete="CASCADE"), index=True)
    at: Mapped[str] = mapped_column(String)
    edits_json: Mapped[str] = mapped_column(String)
    baseline_json: Mapped[str] = mapped_column(String)
    scenario_json: Mapped[str] = mapped_column(String)
    created_at: Mapped[str] = mapped_column(String, default=lambda: datetime.utcnow().isoformat())
