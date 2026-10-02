from sqlalchemy import ForeignKey, String, Float, Integer, LargeBinary
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Patient(Base):
    __tablename__ = "patients"

    patient_id: Mapped[str] = mapped_column(String, primary_key=True)
    display_name: Mapped[str] = mapped_column(String)
    source: Mapped[str] = mapped_column(String)
    age: Mapped[int] = mapped_column(Integer)
    sex: Mapped[str] = mapped_column(String)
    bmi: Mapped[float | None] = mapped_column(Float, nullable=True)
    systolic_bp: Mapped[float | None] = mapped_column(Float, nullable=True)
    years_since_dx: Mapped[float | None] = mapped_column(Float, nullable=True)
    family_history: Mapped[int | None] = mapped_column(Integer, nullable=True)
    prs_z: Mapped[float | None] = mapped_column(Float, nullable=True)

    twin_state: Mapped["TwinState"] = relationship(back_populates="patient", uselist=False)

class TwinState(Base):
    __tablename__ = "twin_state"

    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.patient_id"), primary_key=True)
    status: Mapped[str] = mapped_column(String, default="not_personalized")
    days_of_data: Mapped[float] = mapped_column(Float, default=0.0)
    adapter_blob: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)

    patient: Mapped[Patient] = relationship(back_populates="twin_state")
