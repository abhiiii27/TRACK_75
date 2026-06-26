import math
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Student Attendance Tracker & Predictor API",
    description="FastAPI backend to track subject-wise attendance and run predictive analytics.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class Subject(BaseModel):
    id: str
    name: str
    attended: int = Field(..., ge=0, description="Number of attended classes")
    total: int = Field(..., ge=0, description="Total number of conducted classes")
    targetPercentage: int = Field(75, ge=0, le=100, description="Target attendance percentage")

class SubjectCreate(BaseModel):
    name: str
    attended: int = Field(0, ge=0)
    total: int = Field(0, ge=0)
    targetPercentage: int = Field(75, ge=0, le=100)

class AttendanceLog(BaseModel):
    subjectId: str
    status: str = Field(..., regex="^(present|absent)$")

class PredictionInput(BaseModel):
    subjectId: str
    upcomingClasses: int = Field(5, ge=1, le=50, description="Number of upcoming scheduled classes")
    expectedAttendanceRate: int = Field(80, ge=0, le=100, description="Expected attendance rate for upcoming classes (0-100%)")

class PredictionResult(BaseModel):
    subjectId: str
    currentPercentage: float
    predictedPercentage: float
    targetPercentage: int
    requiredConsecutiveClasses: int
    safeToMissClasses: int
    status: str
    message: str

# --- In-Memory Database (for foundational structure) ---

db_subjects = [
    {"id": "sub_1", "name": "Mathematics II", "attended": 18, "total": 24, "targetPercentage": 75},
    {"id": "sub_2", "name": "Computer Networks", "attended": 14, "total": 15, "targetPercentage": 75},
    {"id": "sub_3", "name": "Database Management", "attended": 12, "total": 18, "targetPercentage": 75},
    {"id": "sub_4", "name": "Artificial Intelligence", "attended": 8, "total": 14, "targetPercentage": 75},
]

# Helper function to find a subject
def find_subject(subject_id: str):
    for sub in db_subjects:
        if sub["id"] == subject_id:
            return sub
    return None

# --- API Endpoints ---

@app.get("/", tags=["General"])
def read_root():
    return {
        "status": "healthy",
        "message": "Student Attendance Tracker FastAPI Backend is live!",
        "version": "1.0.0"
    }

@app.get("/api/subjects", response_model=List[Subject], tags=["Subjects"])
def get_subjects():
    """Retrieve all subjects and their attendance metrics."""
    return db_subjects

@app.post("/api/subjects", response_model=Subject, tags=["Subjects"])
def create_subject(subject: SubjectCreate):
    """Create a new subject for attendance tracking."""
    new_id = f"sub_{len(db_subjects) + 1}"
    new_subject = {
        "id": new_id,
        "name": subject.name,
        "attended": subject.attended,
        "total": subject.total,
        "targetPercentage": subject.targetPercentage
    }
    db_subjects.append(new_subject)
    return new_subject

@app.post("/api/attendance", tags=["Attendance"])
def log_attendance(log: AttendanceLog):
    """Log a direct attendance record (mark present or absent)."""
    sub = find_subject(log.subjectId)
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    sub["total"] += 1
    if log.status == "present":
        sub["attended"] += 1
        
    percentage = (sub["attended"] / sub["total"] * 100) if sub["total"] > 0 else 0.0
    return {
        "message": f"Logged {log.status} for {sub['name']}",
        "subject": sub,
        "currentPercentage": round(percentage, 2)
    }

@app.post("/api/predict", response_model=PredictionResult, tags=["Predictions"])
def predict_attendance(input_data: PredictionInput):
    """
    Perform predictive analysis and planning actions for a specific subject:
    1. Calculates predicted attendance percentage based on upcoming classes and expected attendance rate.
    2. Calculates how many consecutive classes are needed to reach the target.
    3. Calculates how many classes can be safely missed without falling below the target.
    """
    sub = find_subject(input_data.subjectId)
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    attended = sub["attended"]
    total = sub["total"]
    target = sub["targetPercentage"]
    
    # Calculate predicted values
    # expected_attended_upcoming = fraction * upcomingClasses
    expected_fraction = input_data.expectedAttendanceRate / 100.0
    predicted_attended = attended + round(input_data.upcomingClasses * expected_fraction)
    predicted_total = total + input_data.upcomingClasses
    
    current_pct = (attended / total * 100.0) if total > 0 else 100.0
    predicted_pct = (predicted_attended / predicted_total * 100.0) if predicted_total > 0 else 100.0
    
    # Calculate consecutive classes needed to reach target
    # (attended + X) / (total + X) >= target/100
    # attended + X >= target_frac * total + target_frac * X
    # X * (1 - target_frac) >= target_frac * total - attended
    # X >= (target_frac * total - attended) / (1 - target_frac)
    target_frac = target / 100.0
    required_consecutive = 0
    if current_pct < target:
        if target_frac < 1.0:
            val = (target_frac * total - attended) / (1.0 - target_frac)
            required_consecutive = max(0, math.ceil(val))
        else:
            # If target is 100%, required is infinite if they ever missed, or just 0
            required_consecutive = 999 if attended < total else 0
            
    # Calculate classes safe to miss
    # attended / (total + Y) >= target_frac
    # attended >= target_frac * total + target_frac * Y
    # target_frac * Y <= attended - target_frac * total
    # Y <= (attended - target_frac * total) / target_frac
    safe_to_miss = 0
    if current_pct >= target:
        if target_frac > 0:
            val = (attended - target_frac * total) / target_frac
            safe_to_miss = max(0, math.floor(val))
        else:
            safe_to_miss = 999
            
    # Determine risk status
    if predicted_pct >= target:
        status = "safe"
        message = f"You are on track! If you attend at {input_data.expectedAttendanceRate}% rate, you will maintain {round(predicted_pct, 1)}% attendance."
    elif predicted_pct >= target - 5:
        status = "at_risk"
        message = f"Warning: Your attendance will dip to {round(predicted_pct, 1)}%, which is close but below your {target}% target."
    else:
        status = "critical"
        message = f"Critical: Your attendance will fall to {round(predicted_pct, 1)}%. You need to attend {required_consecutive} classes consecutively to secure your target."
        
    return PredictionResult(
        subjectId=input_data.subjectId,
        currentPercentage=round(current_pct, 1),
        predictedPercentage=round(predicted_pct, 1),
        targetPercentage=target,
        requiredConsecutiveClasses=required_consecutive,
        safeToMissClasses=safe_to_miss,
        status=status,
        message=message
    )

@app.get("/api/stats", tags=["General"])
def get_overall_stats():
    """Get high-level aggregated attendance metrics."""
    if not db_subjects:
        return {
            "totalSubjects": 0,
            "overallPercentage": 100.0,
            "totalAttended": 0,
            "totalConducted": 0,
            "safeSubjects": 0
        }
        
    total_attended = sum(s["attended"] for s in db_subjects)
    total_conducted = sum(s["total"] for s in db_subjects)
    overall_percentage = (total_attended / total_conducted * 100.0) if total_conducted > 0 else 100.0
    
    safe_subjects = 0
    for s in db_subjects:
        pct = (s["attended"] / s["total"] * 100.0) if s["total"] > 0 else 100.0
        if pct >= s["targetPercentage"]:
            safe_subjects += 1
            
    return {
        "totalSubjects": len(db_subjects),
        "overallPercentage": round(overall_percentage, 1),
        "totalAttended": total_attended,
        "totalConducted": total_conducted,
        "safeSubjects": safe_subjects,
        "belowTargetSubjects": len(db_subjects) - safe_subjects
    }

@app.get("/api/attendance/risk", tags=["Risk"])
def get_attendance_risk():
    """Get the current dynamic attendance risk score and explanation reasons."""
    if not db_subjects:
        return {
            "riskScore": 0,
            "riskLevel": "SAFE",
            "overallAttendance": 100.0,
            "remainingSafeBunks": 0,
            "reasons": ["No subjects registered yet"]
        }

    total_attended = sum(s["attended"] for s in db_subjects)
    total_conducted = sum(s["total"] for s in db_subjects)
    overall_pct = (total_attended / total_conducted * 100.0) if total_conducted > 0 else 100.0

    score = 0
    reasons = []
    total_safe_bunks = 0
    subjects_below_75 = 0

    for s in db_subjects:
        pct = (s["attended"] / s["total"] * 100.0) if s["total"] > 0 else 100.0
        target_frac = s["targetPercentage"] / 100.0

        # Safe bunks calculation
        safe_to_miss = 0
        if pct >= s["targetPercentage"]:
            if target_frac > 0:
                val = (s["attended"] - target_frac * s["total"]) / target_frac
                safe_to_miss = max(0, math.floor(val))
            else:
                safe_to_miss = 999
        total_safe_bunks += safe_to_miss

        if pct < 75:
            subjects_below_75 += 1
            score += 10
            reasons.append(f"{s['name']} subject below target")

        if pct < 65:
            reasons.append(f"Missing {s['name']} frequently")

    if overall_pct < 75:
        score += 35
        reasons.append("Overall attendance below target")

    # Trend decreasing
    if subjects_below_75 > 0 or overall_pct < 78:
        score += 15
        reasons.append("Attendance trend is decreasing")

    # 3 consecutive absences simulation
    has_consecutive = any(s["total"] > 0 and (s["attended"] / s["total"] < 0.70) for s in db_subjects)
    if has_consecutive:
        score += 20
        reasons.append("Multiple consecutive absences flagged")

    if total_safe_bunks <= 2:
        score += 20
        reasons.append("Only few safe bunks remaining before detention risk")

    final_score = min(100, max(0, score))

    if final_score >= 81:
        risk_level = "CRITICAL"
    elif final_score >= 61:
        risk_level = "HIGH"
    elif final_score >= 31:
        risk_level = "MEDIUM"
    else:
        risk_level = "SAFE"

    if not reasons:
        if final_score == 0:
            reasons.append("Your attendance is healthy.")
        else:
            reasons.append("Keep maintaining your regular attendance.")

    # Unique values
    reasons = list(set(reasons))

    return {
        "riskScore": final_score,
        "riskLevel": risk_level,
        "overallAttendance": round(overall_pct, 1),
        "remainingSafeBunks": total_safe_bunks,
        "reasons": reasons
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
