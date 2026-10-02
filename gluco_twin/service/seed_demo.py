from datetime import datetime, timedelta
from gluco_twin.service.db import (
    init_db, SessionLocal, Patient, TwinState, Condition, LabResult, Timeseries
)
from gluco_twin.data.simulator import simulate_patient_stream

def seed_database():
    print("Initializing SQLite Database schemas...")
    init_db()
    db = SessionLocal()

    # Clear existing data for idempotency during development
    db.query(Patient).delete()
    db.commit()

    start_time = datetime(2026, 9, 20, 0, 0)
    
    # 5 Demo Patients matching TRD Specifications
    patients_data = [
        {"id": "syn_0042", "name": "Meera (High Risk)", "age": 54, "sex": "F", "bmi": 29.4, "hba1c": 8.1, "status": "personalized", "days": 14},
        {"id": "syn_0017", "name": "Rajiv (Moderate Risk)", "age": 61, "sex": "M", "bmi": 27.5, "hba1c": 7.4, "status": "collecting", "days": 4},
        {"id": "syn_0008", "name": "Priya (Low Risk)", "age": 47, "sex": "F", "bmi": 24.1, "hba1c": 6.2, "status": "not_personalized", "days": 2},
        {"id": "syn_0023", "name": "Anil (Low Confidence)", "age": 58, "sex": "M", "bmi": 28.0, "hba1c": 7.8, "status": "collecting", "days": 5},
        {"id": "sha_0101", "name": "Sunita (Real Open)", "age": 51, "sex": "F", "bmi": 26.8, "hba1c": 7.1, "status": "personalized", "days": 14, "source": "real_open"}
    ]

    print("Seeding demo cohort...")
    for p in patients_data:
        end_time = start_time + timedelta(days=p["days"])
        start_str = start_time.isoformat()
        end_str = end_time.isoformat()

        # 1. Create Patient
        patient = Patient(
            patient_id=p["id"],
            display_name=p["name"],
            source=p.get("source", "synthetic"),
            age=p["age"],
            sex=p["sex"],
            bmi=p["bmi"],
            prs_z=0.5 if "syn" in p["id"] else None,
            timeline_start=start_str,
            timeline_end=end_str
        )
        db.add(patient)

        # 2. Add Condition (Required by Schema Integrity Rules)
        condition = Condition(patient_id=p["id"], code="type2_diabetes", name="Type 2 Diabetes Mellitus", onset_date="2020-01-01")
        db.add(condition)

        # 3. Add Static Lab Result (HbA1c)
        lab = LabResult(patient_id=p["id"], code="hba1c", value=p["hba1c"], unit="%", taken_at=start_str)
        db.add(lab)

        # 4. Add Digital Twin State
        twin = TwinState(patient_id=p["id"], status=p["status"], days_of_data=p["days"])
        db.add(twin)

        # 5. Generate and Bulk Insert Timeseries Sensor Data
        print(f"  -> Generating wearable time-series for {p['id']}...")
        df = simulate_patient_stream(
            patient_id=p["id"], hba1c=p["hba1c"], bmi=p["bmi"], 
            start_time=start_time, days=p["days"]
        )

        # Simulate missing sensor data for 'Low Confidence' patient test case
        if p["id"] == "syn_0023":
            df = df.sample(frac=0.5).sort_index()

        db.bulk_insert_mappings(Timeseries, df.to_dict(orient="records"))

    db.commit()
    db.close()
    print("Database seeded successfully! Demo SQLite file is ready at data/demo/demo.db")

if __name__ == "__main__":
    seed_database()
