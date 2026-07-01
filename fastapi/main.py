import math
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import database, models, schemas, auth
from fastapi.responses import JSONResponse
import traceback

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Track75 Backend API",
    description="FastAPI backend to track subject-wise attendance and run predictive analytics with full Authentication.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler to return 400 with {"error": "..."} for frontend compatibility
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request, exc):
    # frontend expects data.error for 400/401 messages
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
        headers=exc.headers
    )

# Catch ALL unhandled exceptions so we never return plain text 500s
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error. Please try again."}
    )

# --- Initial Seed Data Setup ---
DEFAULT_SUBJECT_TEMPLATES = [
    {"name": "Mathematics II", "attended": 18, "total": 24, "target_percentage": 75},
    {"name": "Computer Networks", "attended": 14, "total": 15, "target_percentage": 75},
    {"name": "Database Management", "attended": 12, "total": 18, "target_percentage": 75},
    {"name": "Artificial Intelligence", "attended": 8, "total": 14, "target_percentage": 75},
]

def seed_default_subjects(db: Session, user: models.User):
    for tpl in DEFAULT_SUBJECT_TEMPLATES:
        subject = models.Subject(
            name=tpl["name"],
            attended=tpl["attended"],
            total=tpl["total"],
            target_percentage=tpl["target_percentage"],
            owner_id=user.id
        )
        db.add(subject)
    db.commit()

# --- Auth Routes ---

@app.post("/api/auth/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email.lower().strip()).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    hashed_pwd = auth.get_password_hash(user.password)
    new_user = models.User(
        full_name=user.fullName.strip(),
        email=user.email.lower().strip(),
        password_hash=hashed_pwd,
        setup_complete=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = auth.create_access_token(data={"sub": new_user.email})
    
    return {
        "token": token,
        "user": schemas.UserResponse.model_validate(new_user).model_dump()
    }

@app.post("/api/auth/login")
def login(user_creds: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_creds.email.lower().strip()).first()
    if not user or not auth.verify_password(user_creds.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    token = auth.create_access_token(data={"sub": user.email})
    
    return {
        "token": token,
        "user": schemas.UserResponse.model_validate(user).model_dump()
    }

@app.post("/api/auth/profile-setup")
def profile_setup(setup: schemas.ProfileSetup, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    current_user.college_name = setup.collegeName
    current_user.department = setup.department
    current_user.semester = setup.semester
    current_user.attendance_goal = setup.attendanceGoal
    current_user.setup_complete = True
    
    # Check if subjects exist, if not seed them
    existing_subjects = db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).count()
    if existing_subjects == 0:
        seed_default_subjects(db, current_user)
        
    # Update all subjects with new target
    db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).update(
        {"target_percentage": current_user.attendance_goal}
    )
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Profile setup completed successfully",
        "user": schemas.UserResponse.model_validate(current_user).model_dump()
    }

@app.get("/api/auth/me")
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"user": schemas.UserResponse.model_validate(current_user).model_dump()}


# --- Scoped App Routes ---

@app.get("/api/subjects")
def get_subjects(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    subjects = db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).all()
    # Map DB attributes to frontend expectations (target_percentage -> targetPercentage)
    res = []
    for s in subjects:
        res.append({
            "id": s.id,
            "name": s.name,
            "attended": s.attended,
            "total": s.total,
            "targetPercentage": s.target_percentage
        })
    return res

@app.post("/api/subjects")
def create_subject(sub: schemas.SubjectCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_sub = models.Subject(
        name=sub.name,
        attended=sub.attended,
        total=sub.total,
        target_percentage=sub.targetPercentage,
        owner_id=current_user.id
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return {
        "id": new_sub.id,
        "name": new_sub.name,
        "attended": new_sub.attended,
        "total": new_sub.total,
        "targetPercentage": new_sub.target_percentage
    }

@app.post("/api/attendance")
def log_attendance(log: schemas.AttendanceLog, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    sub = db.query(models.Subject).filter(models.Subject.id == log.subjectId, models.Subject.owner_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    sub.total += 1
    if log.status == "present":
        sub.attended += 1
        
    db.commit()
    db.refresh(sub)
    
    percentage = (sub.attended / sub.total * 100) if sub.total > 0 else 0.0
    return {
        "message": f"Logged {log.status} for {sub.name}",
        "subject": {
            "id": sub.id,
            "name": sub.name,
            "attended": sub.attended,
            "total": sub.total,
            "targetPercentage": sub.target_percentage
        },
        "currentPercentage": round(percentage, 2)
    }

@app.post("/api/predict", response_model=schemas.PredictionResult)
def predict_attendance(input_data: schemas.PredictionInput, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    sub = db.query(models.Subject).filter(models.Subject.id == input_data.subjectId, models.Subject.owner_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    attended = sub.attended
    total = sub.total
    target = sub.target_percentage
    
    expected_fraction = input_data.expectedAttendanceRate / 100.0
    predicted_attended = attended + round(input_data.upcomingClasses * expected_fraction)
    predicted_total = total + input_data.upcomingClasses
    
    current_pct = (attended / total * 100.0) if total > 0 else 100.0
    predicted_pct = (predicted_attended / predicted_total * 100.0) if predicted_total > 0 else 100.0
    
    target_frac = target / 100.0
    required_consecutive = 0
    if current_pct < target:
        if target_frac < 1.0:
            val = (target_frac * total - attended) / (1.0 - target_frac)
            required_consecutive = max(0, math.ceil(val))
        else:
            required_consecutive = 999 if attended < total else 0
            
    safe_to_miss = 0
    if current_pct >= target:
        if target_frac > 0:
            val = (attended - target_frac * total) / target_frac
            safe_to_miss = max(0, math.floor(val))
        else:
            safe_to_miss = 999
            
    if predicted_pct >= target:
        status = "safe"
        message = f"You are on track! If you attend at {input_data.expectedAttendanceRate}% rate, you will maintain {round(predicted_pct, 1)}% attendance."
    elif predicted_pct >= target - 5:
        status = "at_risk"
        message = f"Warning: Your attendance will dip to {round(predicted_pct, 1)}%, which is close but below your {target}% target."
    else:
        status = "critical"
        message = f"Critical: Your attendance will fall to {round(predicted_pct, 1)}%. You need to attend {required_consecutive} classes consecutively to secure your target."
        
    return schemas.PredictionResult(
        subjectId=input_data.subjectId,
        currentPercentage=round(current_pct, 1),
        predictedPercentage=round(predicted_pct, 1),
        targetPercentage=target,
        requiredConsecutiveClasses=required_consecutive,
        safeToMissClasses=safe_to_miss,
        status=status,
        message=message
    )

@app.get("/api/stats")
def get_overall_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    subjects = db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).all()
    if not subjects:
        return {
            "totalSubjects": 0,
            "overallPercentage": 100.0,
            "totalAttended": 0,
            "totalConducted": 0,
            "safeSubjects": 0,
            "belowTargetSubjects": 0
        }
        
    total_attended = sum(s.attended for s in subjects)
    total_conducted = sum(s.total for s in subjects)
    overall_percentage = (total_attended / total_conducted * 100.0) if total_conducted > 0 else 100.0
    
    safe_subjects = sum(1 for s in subjects if (s.attended / s.total * 100.0 if s.total > 0 else 100.0) >= s.target_percentage)
            
    return {
        "totalSubjects": len(subjects),
        "overallPercentage": round(overall_percentage, 1),
        "totalAttended": total_attended,
        "totalConducted": total_conducted,
        "safeSubjects": safe_subjects,
        "belowTargetSubjects": len(subjects) - safe_subjects
    }

@app.get("/api/attendance/risk")
def get_attendance_risk(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    subjects = db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).all()
    if not subjects:
        return {
            "riskScore": 0,
            "riskLevel": "SAFE",
            "overallAttendance": 100.0,
            "remainingSafeBunks": 0,
            "reasons": ["No subjects registered yet"]
        }

    total_attended = sum(s.attended for s in subjects)
    total_conducted = sum(s.total for s in subjects)
    overall_pct = (total_attended / total_conducted * 100.0) if total_conducted > 0 else 100.0

    score = 0
    reasons = []
    total_safe_bunks = 0
    subjects_below_75 = 0

    for s in subjects:
        pct = (s.attended / s.total * 100.0) if s.total > 0 else 100.0
        target_frac = s.target_percentage / 100.0

        safe_to_miss = 0
        if pct >= s.target_percentage:
            if target_frac > 0:
                val = (s.attended - target_frac * s.total) / target_frac
                safe_to_miss = max(0, math.floor(val))
            else:
                safe_to_miss = 999
        total_safe_bunks += safe_to_miss

        if pct < 75:
            subjects_below_75 += 1
            score += 10
            reasons.append(f"{s.name} subject below target")

        if pct < 65:
            reasons.append(f"Missing {s.name} frequently")

    if overall_pct < 75:
        score += 35
        reasons.append("Overall attendance below target")

    if subjects_below_75 > 0 or overall_pct < 78:
        score += 15
        reasons.append("Attendance trend is decreasing")

    has_consecutive = any(s.total > 0 and (s.attended / s.total < 0.70) for s in subjects)
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

    reasons = list(set(reasons))

    return {
        "riskScore": final_score,
        "riskLevel": risk_level,
        "overallAttendance": round(overall_pct, 1),
        "remainingSafeBunks": total_safe_bunks,
        "reasons": reasons
    }

@app.post("/api/reset")
def reset_data(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).delete()
    seed_default_subjects(db, current_user)
    return {"message": "Database reset to defaults"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
