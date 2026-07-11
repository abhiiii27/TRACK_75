import math
from datetime import date, datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import database, models, schemas, auth
from fastapi.responses import JSONResponse
import traceback
from services.notification_service import NotificationService

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
    
    NotificationService.notify_new_user(db, current_user)
    
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
    # Duplicate subject validation
    existing = db.query(models.Subject).filter(
        models.Subject.owner_id == current_user.id,
        models.Subject.name == sub.name.strip()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Subject '{sub.name}' already exists.")

    new_sub = models.Subject(
        name=sub.name.strip(),
        attended=sub.attended,
        total=sub.total,
        target_percentage=sub.targetPercentage,
        owner_id=current_user.id
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)

    NotificationService.notify_new_subject(db, current_user.id, new_sub)

    return {
        "id": new_sub.id,
        "name": new_sub.name,
        "attended": new_sub.attended,
        "total": new_sub.total,
        "targetPercentage": new_sub.target_percentage
    }

@app.put("/api/subjects/{subject_id}")
def update_subject(subject_id: str, update: schemas.SubjectUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    sub = db.query(models.Subject).filter(models.Subject.id == subject_id, models.Subject.owner_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Check duplicate name if name is being changed
    if update.name is not None and update.name.strip() != sub.name:
        existing = db.query(models.Subject).filter(
            models.Subject.owner_id == current_user.id,
            models.Subject.name == update.name.strip(),
            models.Subject.id != subject_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Subject '{update.name}' already exists.")
        sub.name = update.name.strip()

    if update.attended is not None:
        sub.attended = update.attended
    if update.total is not None:
        sub.total = update.total
    if update.targetPercentage is not None:
        sub.target_percentage = update.targetPercentage

    db.commit()
    db.refresh(sub)
    return {
        "id": sub.id,
        "name": sub.name,
        "attended": sub.attended,
        "total": sub.total,
        "targetPercentage": sub.target_percentage
    }

@app.delete("/api/subjects/{subject_id}")
def delete_subject(subject_id: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    sub = db.query(models.Subject).filter(models.Subject.id == subject_id, models.Subject.owner_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")

    db.delete(sub)
    db.commit()
    return {"message": f"Subject '{sub.name}' deleted successfully"}

@app.post("/api/attendance")
def log_attendance(log: schemas.AttendanceLog, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    sub = db.query(models.Subject).filter(models.Subject.id == log.subjectId, models.Subject.owner_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")

    old_pct = (sub.attended / sub.total * 100) if sub.total > 0 else 100.0

    sub.total += 1
    if log.status == "present":
        sub.attended += 1

    # Create an attendance record for history tracking
    record = models.AttendanceRecord(
        subject_id=sub.id,
        owner_id=current_user.id,
        status=log.status,
        date=date.today().isoformat()
    )
    db.add(record)
    db.commit()
    db.refresh(sub)

    new_pct = (sub.attended / sub.total * 100) if sub.total > 0 else 0.0

    # Generate notifications after attendance is committed (non-blocking)
    try:
        generate_notifications(db, current_user)
    except Exception:
        pass  # Notification failures must never break attendance logging

    return {
        "message": f"Logged {log.status} for {sub.name}",
        "subject": {
            "id": sub.id,
            "name": sub.name,
            "attended": sub.attended,
            "total": sub.total,
            "targetPercentage": sub.target_percentage
        },
        "currentPercentage": round(new_pct, 2)
    }

@app.put("/api/attendance/{record_id}")
def update_attendance(record_id: str, update: schemas.AttendanceUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    record = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.id == record_id, models.AttendanceRecord.owner_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    sub = db.query(models.Subject).filter(models.Subject.id == record.subject_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")

    old_pct = (sub.attended / sub.total * 100) if sub.total > 0 else 100.0

    # If status is changing, update the subject counts
    if update.status is not None and update.status != record.status:
        if record.status == "present" and update.status == "absent":
            sub.attended -= 1
        elif record.status == "absent" and update.status == "present":
            sub.attended += 1
        record.status = update.status

    if update.notes is not None:
        record.notes = update.notes

    db.commit()
    db.refresh(record)
    db.refresh(sub)

    new_pct = (sub.attended / sub.total * 100) if sub.total > 0 else 0.0

    # Generate notifications after commit (non-blocking)
    try:
        generate_notifications(db, current_user)
    except Exception:
        pass

    return {
        "id": record.id,
        "subjectId": record.subject_id,
        "subjectName": sub.name,
        "status": record.status,
        "date": record.date,
        "notes": record.notes
    }

@app.delete("/api/attendance/{record_id}")
def delete_attendance(record_id: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    record = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.id == record_id, models.AttendanceRecord.owner_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    sub = db.query(models.Subject).filter(models.Subject.id == record.subject_id).first()
    if sub:
        sub.total -= 1
        if record.status == "present":
            sub.attended -= 1
        # Ensure counts never go below 0
        sub.total = max(0, sub.total)
        sub.attended = max(0, sub.attended)

    db.delete(record)
    db.commit()
    return {"message": "Attendance record deleted successfully"}

@app.get("/api/attendance/history")
def get_attendance_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    records = db.query(models.AttendanceRecord).filter(
        models.AttendanceRecord.owner_id == current_user.id
    ).order_by(models.AttendanceRecord.created_at.desc()).limit(100).all()

    result = []
    for r in records:
        sub = db.query(models.Subject).filter(models.Subject.id == r.subject_id).first()
        result.append({
            "id": r.id,
            "subjectId": r.subject_id,
            "subjectName": sub.name if sub else "Deleted Subject",
            "status": r.status,
            "date": r.date,
            "notes": r.notes
        })
    return result

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
    db.query(models.AttendanceRecord).filter(models.AttendanceRecord.owner_id == current_user.id).delete()
    db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).delete()
    seed_default_subjects(db, current_user)
    return {"message": "Database reset to defaults"}

@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    subjects = db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).all()

    total_attended = sum(s.attended for s in subjects)
    total_conducted = sum(s.total for s in subjects)
    overall_percentage = (total_attended / total_conducted * 100.0) if total_conducted > 0 else 100.0
    missed_classes = total_conducted - total_attended

    safe_subjects = sum(1 for s in subjects if (s.attended / s.total * 100.0 if s.total > 0 else 100.0) >= s.target_percentage)

    # Recent activity from attendance records
    recent_records = db.query(models.AttendanceRecord).filter(
        models.AttendanceRecord.owner_id == current_user.id
    ).order_by(models.AttendanceRecord.created_at.desc()).limit(5).all()

    recent_activity = []
    for r in recent_records:
        sub = db.query(models.Subject).filter(models.Subject.id == r.subject_id).first()
        status_text = "Present" if r.status == "present" else "Absent"
        recent_activity.append({
            "id": r.id,
            "text": f"Logged {status_text} for {sub.name if sub else 'Unknown'}",
            "time": r.date
        })

    return {
        "totalSubjects": len(subjects),
        "overallPercentage": round(overall_percentage, 1),
        "totalAttended": total_attended,
        "totalConducted": total_conducted,
        "missedClasses": missed_classes,
        "safeSubjects": safe_subjects,
        "belowTargetSubjects": len(subjects) - safe_subjects,
        "recentActivity": recent_activity
    }

from datetime import datetime, timedelta

@app.get("/api/analytics", response_model=schemas.AnalyticsResponse)
def get_analytics(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    subjects = db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).all()
    records = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.owner_id == current_user.id).all()
    
    # 1. Base computations
    total_attended = sum(s.attended for s in subjects)
    total_conducted = sum(s.total for s in subjects)
    overall_pct = (total_attended / total_conducted * 100.0) if total_conducted > 0 else 0.0

    # Weekly & Monthly dates
    today = datetime.now().date()
    seven_days_ago = today - timedelta(days=7)
    fourteen_days_ago = today - timedelta(days=14)
    thirty_days_ago = today - timedelta(days=30)
    sixty_days_ago = today - timedelta(days=60)

    # Weekly Summary (last 7 days vs previous 7 days)
    w_attended = 0
    w_missed = 0
    w_prev_attended = 0
    w_prev_missed = 0

    # Monthly Summary (last 30 days vs previous 30 days)
    m_attended = 0
    m_missed = 0
    m_prev_attended = 0
    m_prev_missed = 0

    # For weekly/monthly graphs and heatmap
    day_counts = {day: {"attended": 0, "missed": 0} for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
    month_counts = {}  # "YYYY-MM": {"attended": 0, "total": 0}
    
    for i in range(6):
        m_date = today.replace(day=1) - timedelta(days=30 * i)
        m_str = m_date.strftime("%Y-%m")
        month_counts[m_str] = {"attended": 0, "total": 0}

    for r in records:
        r_date = datetime.strptime(r.date, "%Y-%m-%d").date()
        
        # Weekly
        if r_date > seven_days_ago:
            if r.status == "present": w_attended += 1
            else: w_missed += 1
        elif r_date > fourteen_days_ago:
            if r.status == "present": w_prev_attended += 1
            else: w_prev_missed += 1
            
        # Monthly
        if r_date > thirty_days_ago:
            if r.status == "present": m_attended += 1
            else: m_missed += 1
        elif r_date > sixty_days_ago:
            if r.status == "present": m_prev_attended += 1
            else: m_prev_missed += 1

        # Day of week (last 7 days)
        if r_date > seven_days_ago:
            day_name = r_date.strftime("%a")
            if r.status == "present": day_counts[day_name]["attended"] += 1
            else: day_counts[day_name]["missed"] += 1

        # Month grouping
        m_str = r_date.strftime("%Y-%m")
        if m_str in month_counts:
            month_counts[m_str]["total"] += 1
            if r.status == "present":
                month_counts[m_str]["attended"] += 1

    w_total = w_attended + w_missed
    w_pct = (w_attended / w_total * 100.0) if w_total > 0 else 0.0
    w_prev_total = w_prev_attended + w_prev_missed
    w_prev_pct = (w_prev_attended / w_prev_total * 100.0) if w_prev_total > 0 else 0.0
    w_growth = w_pct - w_prev_pct

    m_total = m_attended + m_missed
    m_pct = (m_attended / m_total * 100.0) if m_total > 0 else 0.0
    m_prev_total = m_prev_attended + m_prev_missed
    m_prev_pct = (m_prev_attended / m_prev_total * 100.0) if m_prev_total > 0 else 0.0
    m_growth = m_pct - m_prev_pct

    # Subject Comparison & Goal Progress
    sub_comparisons = []
    total_safe_bunks = 0
    total_required = 0

    best_sub = None
    worst_sub = None
    most_missed_sub = None
    
    for s in subjects:
        pct = (s.attended / s.total * 100.0) if s.total > 0 else 0.0
        target_frac = s.target_percentage / 100.0
        
        safe = 0
        req = 0
        
        if pct >= s.target_percentage:
            if target_frac > 0:
                safe = max(0, math.floor((s.attended - target_frac * s.total) / target_frac))
        else:
            if target_frac < 1.0:
                req = max(0, math.ceil((target_frac * s.total - s.attended) / (1.0 - target_frac)))
            else:
                req = 999
                
        total_safe_bunks += safe
        total_required += req
        
        sub_comparisons.append({
            "name": s.name,
            "percentage": pct,
            "attended": s.attended,
            "missed": s.total - s.attended,
            "totalClasses": s.total,
            "safeBunks": safe,
            "requiredClasses": req
        })

    # Sort comparisons for best/worst calculation
    sorted_subs = sorted(sub_comparisons, key=lambda x: x["percentage"])
    if sorted_subs:
        worst_sub = sorted_subs[0]
        best_sub = sorted_subs[-1]
    
    missed_sorted = sorted(sub_comparisons, key=lambda x: x["missed"], reverse=True)
    if missed_sorted:
        most_missed_sub = missed_sorted[0]

    # Trend Determination
    trend_str = "Stable"
    if w_growth > 2.0: trend_str = "Improving"
    elif w_growth < -2.0: trend_str = "Declining"

    # Graph Data
    weekly_graph = []
    for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]:
        weekly_graph.append({
            "name": day,
            "Attended": day_counts[day]["attended"],
            "Missed": day_counts[day]["missed"]
        })

    monthly_graph = []
    for m in reversed(list(month_counts.keys())):
        c = month_counts[m]
        pct = (c["attended"] / c["total"] * 100.0) if c["total"] > 0 else 0.0
        # Convert YYYY-MM to MMM
        dt = datetime.strptime(m, "%Y-%m")
        monthly_graph.append({
            "name": dt.strftime("%b"),
            "Percentage": pct
        })
        
    trend_data = [
        {"name": "Previous Month", "Percentage": m_prev_pct},
        {"name": "Current Month", "Percentage": m_pct},
        {"name": "Previous Week", "Percentage": w_prev_pct},
        {"name": "Current Week", "Percentage": w_pct},
    ]

    # Heatmap (Last 4 weeks)
    heatmap = []
    for w in range(4):
        days_status = []
        for d in range(5): # Mon-Fri
            target_date = today - timedelta(days=(w * 7 + (4-d)))
            # Check records for target_date
            day_recs = [r for r in records if r.date == target_date.isoformat()]
            if not day_recs:
                days_status.append("none")
            elif any(r.status == "present" for r in day_recs):
                days_status.append("attended")
            else:
                days_status.append("missed")
        heatmap.append({"week": f"Week {4-w}", "days": days_status})

    # Insights
    best_day = max(day_counts.items(), key=lambda x: x[1]["attended"])[0] if any(d["attended"] > 0 for d in day_counts.values()) else "N/A"
    worst_day = max(day_counts.items(), key=lambda x: x[1]["missed"])[0] if any(d["missed"] > 0 for d in day_counts.values()) else "N/A"
    
    insights = {
        "bestSubject": best_sub["name"] if best_sub else "N/A",
        "worstSubject": worst_sub["name"] if worst_sub else "N/A",
        "highestAttendance": best_sub["percentage"] if best_sub else 0.0,
        "lowestAttendance": worst_sub["percentage"] if worst_sub else 0.0,
        "mostMissedSubject": most_missed_sub["name"] if most_missed_sub else "N/A",
        "mostConsistentSubject": best_sub["name"] if best_sub else "N/A",
        "averageAttendance": overall_pct,
        "highestAttendanceDay": best_day,
        "lowestAttendanceDay": worst_day
    }

    future_ai = {
        "riskScore": overall_pct, # Placeholder
        "aiRecommendations": [],
        "smartNotifications": []
    }

    return {
        "weeklySummary": {
            "percentage": w_pct,
            "attended": w_attended,
            "missed": w_missed,
            "totalClasses": w_total,
            "comparison": f"{'+' if w_growth >= 0 else ''}{round(w_growth, 1)}%",
            "status": "On Track" if w_pct >= current_user.attendance_goal else "Risk of Short"
        },
        "monthlySummary": {
            "percentage": m_pct,
            "attended": m_attended,
            "missed": m_missed,
            "totalClasses": m_total,
            "comparison": f"{'+' if m_growth >= 0 else ''}{round(m_growth, 1)}%",
            "status": "Optimal Standing" if m_pct >= current_user.attendance_goal else "Risk of Short"
        },
        "subjectComparison": sub_comparisons,
        "goalProgress": {
            "targetAttendance": current_user.attendance_goal,
            "currentAttendance": overall_pct,
            "remainingClasses": total_required,
            "safeBunks": total_safe_bunks
        },
        "attendanceTrend": trend_str,
        "trendData": trend_data,
        "weeklyGraphData": weekly_graph,
        "monthlyGraphData": monthly_graph,
        "heatmapWeeks": heatmap,
        "smartInsights": insights,
        "futureAI": future_ai
    }

@app.get("/api/ai/predict", response_model=schemas.AIPredictionResponse)
def get_ai_prediction(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    from datetime import date, timedelta
    
    subjects = db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).all()
    records = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.owner_id == current_user.id).all()
    
    total_attended = sum(s.attended for s in subjects)
    total_classes = sum(s.total for s in subjects)
    current_percentage = (total_attended / total_classes * 100.0) if total_classes > 0 else 0.0
    
    # Calculate Trend
    today = date.today()
    last_7_days = [(today - timedelta(days=i)).isoformat() for i in range(7)]
    prev_7_days = [(today - timedelta(days=i)).isoformat() for i in range(7, 14)]
    
    recent_records = [r for r in records if r.date in last_7_days]
    prev_records = [r for r in records if r.date in prev_7_days]
    
    def get_pct(recs):
        if not recs: return 0.0
        att = sum(1 for r in recs if r.status == "present")
        return (att / len(recs)) * 100.0
        
    recent_pct = get_pct(recent_records)
    prev_pct = get_pct(prev_records)
    
    trend = "Stable"
    if recent_pct > prev_pct + 5:
        trend = "Improving"
    elif recent_pct < prev_pct - 5:
        trend = "Declining"
        
    # Calculate Prediction & Remaining Stats
    total_safe = 0
    total_req = 0
    projected_final_attended = 0
    projected_final_total = 0
    
    for s in subjects:
        target_frac = s.target_percentage / 100.0
        # Estimate semester length: 45 classes or +15 classes if already far along
        estimated_total = max(45, s.total + 15)
        remaining = estimated_total - s.total
        
        # Predicted behavior: recent velocity, or overall velocity, or target fallback
        student_velocity = recent_pct / 100.0 if recent_records else (s.attended / s.total if s.total > 0 else target_frac)
        predicted_attended = s.attended + (remaining * student_velocity)
        
        projected_final_attended += predicted_attended
        projected_final_total += estimated_total
        
        if s.total > 0:
            safe = s.attended - math.ceil(target_frac * s.total)
            if safe > 0:
                total_safe += math.floor(safe / target_frac)
            
            if (s.attended / s.total) < target_frac and target_frac < 1.0:
                total_req += max(0, math.ceil((target_frac * s.total - s.attended) / (1.0 - target_frac)))
    
    predicted_percentage = (projected_final_attended / projected_final_total * 100.0) if projected_final_total > 0 else 0.0
    
    # Calculate Risk Score (0-100, where 100 is max risk)
    goal_diff = current_user.attendance_goal - current_percentage
    risk_score = 0
    if total_classes == 0:
        risk_score = 0
    else:
        if goal_diff > 0:
            risk_score = min(100, 50 + (goal_diff * 2.5))
        else:
            risk_score = max(0, 50 - (abs(goal_diff) * 2))
            
        if trend == "Declining":
            risk_score = min(100, risk_score + 15)
        elif trend == "Improving":
            risk_score = max(0, risk_score - 15)
            
    risk_level = "Safe"
    if risk_score > 75:
        risk_level = "High"
    elif risk_score > 40:
        risk_level = "Medium"
        
    # Confidence Score
    confidence = "Low"
    if total_classes > 50:
        confidence = "High"
    elif total_classes > 15:
        confidence = "Medium"
        
    # AI Insight Rule Engine
    insight = "Start logging your classes to get personalized AI predictions."
    if total_classes > 0:
        if risk_level == "High":
            insight = f"Critical Alert: Your attendance ({current_percentage:.1f}%) is dangerously below your goal of {current_user.attendance_goal}%. You must attend the next {total_req} classes consistently to recover your semester trajectory."
        elif risk_level == "Medium":
            insight = f"Caution: Your predicted end-of-semester attendance is trending towards {predicted_percentage:.1f}%. Since your trend is {trend}, pay close attention to your upcoming lectures to stabilize your standing."
        else:
            insight = f"Excellent pacing. You are maintaining a healthy {trend} trend. If you continue at this rate, your predicted semester attendance will comfortably hit {predicted_percentage:.1f}%, leaving you with a buffer of {total_safe} safe bunks."
            
    return schemas.AIPredictionResponse(
        currentPercentage=current_percentage,
        predictedPercentage=predicted_percentage,
        riskScore=int(risk_score),
        riskLevel=risk_level,
        safeBunksRemaining=total_safe,
        requiredClasses=total_req,
        attendanceTrend=trend,
        confidenceScore=confidence,
        aiInsight=insight
    )

@app.get("/api/ai/recommendations", response_model=schemas.AIRecommendationResponse)
def get_ai_recommendations(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    subjects = db.query(models.Subject).filter(models.Subject.owner_id == current_user.id).all()
    
    if not subjects:
        return schemas.AIRecommendationResponse(
            todayFocus="Register your first subject to receive AI recommendations.",
            weakestSubject="N/A",
            strongestSubject="N/A",
            attendanceSummary="No subjects registered yet.",
            motivationMessage="Let's get started on tracking your attendance!",
            recoveryPlan=["Add your first subject using the dashboard."],
            priorityTasks=[
                schemas.PriorityTask(
                    id="setup-1",
                    title="Register Subjects",
                    priority="High",
                    action="Add Subject",
                    reason="System needs subjects to analyze."
                )
            ]
        )
        
    total_attended = sum(s.attended for s in subjects)
    total_classes = sum(s.total for s in subjects)
    overall_pct = (total_attended / total_classes * 100) if total_classes > 0 else 0
    
    # Calculate percentages and find weakest/strongest
    subject_stats = []
    for s in subjects:
        pct = (s.attended / s.total * 100) if s.total > 0 else 100
        target = s.target_percentage
        deficit = target - pct
        subject_stats.append({
            "subject": s,
            "pct": pct,
            "deficit": deficit,
            "is_safe": pct >= target
        })
        
    # Sort to find weakest and strongest
    subject_stats.sort(key=lambda x: x["pct"])
    weakest = subject_stats[0]
    strongest = subject_stats[-1]
    
    weakest_name = weakest["subject"].name if weakest["subject"].total > 0 else "None yet"
    strongest_name = strongest["subject"].name if strongest["subject"].total > 0 else "None yet"
    
    # Generate Priority Tasks
    priority_tasks = []
    task_id_counter = 1
    
    # Check subjects that are below target
    below_target = [st for st in subject_stats if not st["is_safe"]]
    safe_subjects = [st for st in subject_stats if st["is_safe"]]
    
    for st in below_target:
        priority = "High" if st["deficit"] > 10 else "Medium"
        s = st["subject"]
        
        # Calculate exactly how many consecutive classes are needed
        required_classes = 1
        temp_attended = s.attended
        temp_total = s.total
        while (temp_attended / temp_total * 100) < s.target_percentage:
            required_classes += 1
            temp_attended += 1
            temp_total += 1
            if required_classes > 30: # sanity limit
                break
                
        action_msg = f"Attend {required_classes} consecutive classes" if required_classes > 1 else "Attend next class"
        
        priority_tasks.append(schemas.PriorityTask(
            id=f"task-{task_id_counter}",
            title=f"Recover {s.name}",
            priority=priority,
            action=action_msg,
            reason=f"Current ({st['pct']:.1f}%) is below {s.target_percentage}% goal."
        ))
        task_id_counter += 1
        
    # Positive Empty/Safe State
    if len(priority_tasks) == 0:
        priority_tasks.append(schemas.PriorityTask(
            id=f"task-{task_id_counter}",
            title="All Subjects Safe",
            priority="Low",
            action="Continue attending classes to preserve your safe attendance margin.",
            reason="You have exceeded all targets!"
        ))
    else:
        if strongest["subject"].total > 0:
             priority_tasks.append(schemas.PriorityTask(
                id=f"task-{task_id_counter}",
                title=f"Buffer {strongest['subject'].name}",
                priority="Low",
                action="Attend all scheduled lectures this week.",
                reason=f"Leading subject at {strongest['pct']:.1f}%."
            ))
            
    # Generate Today Focus
    if below_target:
        todayFocus = f"Focus on {weakest['subject'].name} to stop attendance drop."
    else:
        todayFocus = "Perfect standing! Continue your winning streak."
        
    # Generate Recovery Plan
    recoveryPlan = []
    if below_target:
        recoveryPlan.append(f"Attend {weakest['subject'].name} without fail.")
        if len(below_target) > 1:
            recoveryPlan.append(f"Do not skip {below_target[1]['subject'].name}.")
        recoveryPlan.append("Pause all safe bunks temporarily.")
    else:
        recoveryPlan.append("Keep attending at your current pace.")
        recoveryPlan.append("Accumulate safe bunks for emergencies.")
        recoveryPlan.append(f"Keep an eye on {weakest['subject'].name}.")
        
    # Generate Attendance Summary
    safe_count = len(safe_subjects)
    risk_count = len(below_target)
    attendanceSummary = f"Overall Attendance: {overall_pct:.1f}%\n✅ Safe Subjects: {safe_count}\n⚠️ Need Improvement: {risk_count}"
    
    # Motivation Message
    if overall_pct >= current_user.attendance_goal:
        motivationMessage = "Great work! Maintain your current attendance trend."
    elif overall_pct >= current_user.attendance_goal - 10:
        motivationMessage = "You are close to your goal. A little consistency will keep you above the target."
    else:
        motivationMessage = "Your attendance requires immediate attention. Focus on the highest-priority subjects first."

    return schemas.AIRecommendationResponse(
        todayFocus=todayFocus,
        weakestSubject=weakest_name,
        strongestSubject=strongest_name,
        attendanceSummary=attendanceSummary,
        motivationMessage=motivationMessage,
        recoveryPlan=recoveryPlan,
        priorityTasks=priority_tasks
    )

# =============================================================================
# Smart Notification Engine – Phase 5A
# =============================================================================

TYPE_PRIORITY = {"Critical": 0, "Warning": 1, "Success": 2, "Info": 3}

def _upsert_notification(db: Session, user_id: str, dedup_key: str, n_type: str,
                         category: str, title: str, message: str,
                         action: str = None, related_subject_id: str = None):
    """
    Upsert a notification by dedup_key.
    - If an unread/read notification with the same key exists → update title/message/updated_at/created_at.
    - If a resolved notification exists → re-open it as unread with new content.
    - Otherwise → insert new notification.
    """
    now = datetime.utcnow()
    existing = (
        db.query(models.Notification)
        .filter(
            models.Notification.user_id == user_id,
            models.Notification.dedup_key == dedup_key,
        )
        .first()
    )
    if existing:
        existing.type = n_type
        existing.category = category
        existing.title = title
        existing.message = message
        existing.action = action
        existing.related_subject_id = related_subject_id
        existing.updated_at = now
        # Bump created_at so it rises to top of feed
        existing.created_at = now
        # Re-open if previously resolved
        if existing.status == "resolved":
            existing.status = "unread"
    else:
        notif = models.Notification(
            user_id=user_id,
            dedup_key=dedup_key,
            type=n_type,
            category=category,
            title=title,
            message=message,
            action=action,
            related_subject_id=related_subject_id,
            status="unread",
            created_at=now,
            updated_at=now,
        )
        db.add(notif)


def _resolve_notification(db: Session, user_id: str, dedup_key: str):
    """Mark a notification as resolved if it exists and is not already resolved."""
    existing = (
        db.query(models.Notification)
        .filter(
            models.Notification.user_id == user_id,
            models.Notification.dedup_key == dedup_key,
        )
        .first()
    )
    if existing and existing.status != "resolved":
        existing.status = "resolved"
        existing.updated_at = datetime.utcnow()


def _enforce_retention(db: Session, user_id: str, max_count: int = 30):
    """
    Keep at most `max_count` notifications per user.
    Deletion order: oldest READ → oldest RESOLVED → oldest INFO → oldest SUCCESS.
    Never auto-delete unread Critical or Warning notifications.
    """
    total = db.query(models.Notification).filter(
        models.Notification.user_id == user_id
    ).count()

    if total <= max_count:
        return

    to_delete = total - max_count

    # Priority delete order (safe to auto-remove)
    candidate_filters = [
        (models.Notification.status == "read"),
        (models.Notification.status == "resolved"),
        (models.Notification.type == "Info", models.Notification.status == "unread"),
        (models.Notification.type == "Success", models.Notification.status == "unread"),
    ]

    for conditions in candidate_filters:
        if to_delete <= 0:
            break
        q = db.query(models.Notification).filter(
            models.Notification.user_id == user_id
        )
        if isinstance(conditions, tuple):
            for cond in conditions:
                q = q.filter(cond)
        else:
            q = q.filter(conditions)

        candidates = q.order_by(models.Notification.created_at.asc()).limit(to_delete).all()
        for c in candidates:
            db.delete(c)
        to_delete -= len(candidates)


def generate_notifications(db: Session, user: models.User):
    """
    Generate / update all notifications for `user` based on current SQLite data.
    Called inside an isolated try/except so failures NEVER break other endpoints.
    """
    try:
        subjects = db.query(models.Subject).filter(
            models.Subject.owner_id == user.id
        ).all()

        # --- No subjects registered ---
        if not subjects:
            _upsert_notification(
                db, user.id,
                dedup_key="no_subjects",
                n_type="Info",
                category="System",
                title="Welcome to Track75!",
                message="Add your first subject to start tracking attendance and receiving smart alerts.",
                action="Add Subject",
            )
            db.commit()
            return

        # If there are subjects now, resolve the no-subjects notice
        _resolve_notification(db, user.id, "no_subjects")

        # Per-subject analysis
        for s in subjects:
            pct = (s.attended / s.total * 100) if s.total > 0 else 100.0
            target = s.target_percentage

            safe_bunks = 0
            if s.total > 0:
                temp_total = s.total
                temp_attended = s.attended
                while True:
                    new_pct = (temp_attended / (temp_total + 1)) * 100
                    if new_pct < target:
                        break
                    temp_total += 1
                    safe_bunks += 1
                    if safe_bunks >= 50:
                        break

            # ---- Critical: below 65% ----
            dedup_critical = f"critical:{s.id}"
            dedup_warning  = f"warning:{s.id}"
            dedup_low_safe = f"low_safe_bunks:{s.id}"
            dedup_achieved = f"achieved:{s.id}"

            if pct < 65:
                classes_needed = 0
                ta, tt = s.attended, s.total
                while (ta / tt * 100) < target and classes_needed < 50:
                    ta += 1; tt += 1; classes_needed += 1

                _upsert_notification(
                    db, user.id,
                    dedup_key=dedup_critical,
                    n_type="Critical",
                    category="Attendance",
                    title=f"Critical: {s.name} at {pct:.1f}%",
                    message=f"Attendance is critically low. You need {classes_needed} consecutive classes to reach the {target}% target.",
                    action="Open Subject",
                    related_subject_id=s.id,
                )
                # Resolve warning if critical takes over
                _resolve_notification(db, user.id, dedup_warning)
                _resolve_notification(db, user.id, dedup_achieved)

            elif pct < target:
                # ---- Warning: below target but >= 65% ----
                classes_needed = 0
                ta, tt = s.attended, s.total
                while tt > 0 and (ta / tt * 100) < target and classes_needed < 50:
                    ta += 1; tt += 1; classes_needed += 1

                _upsert_notification(
                    db, user.id,
                    dedup_key=dedup_warning,
                    n_type="Warning",
                    category="Attendance",
                    title=f"Below Target: {s.name} at {pct:.1f}%",
                    message=f"Attend {classes_needed} consecutive classes to reach your {target}% goal.",
                    action="Open Subject",
                    related_subject_id=s.id,
                )
                _resolve_notification(db, user.id, dedup_critical)
                _resolve_notification(db, user.id, dedup_achieved)

            else:
                # ---- Subject is safe: resolve critical/warning ----
                _resolve_notification(db, user.id, dedup_critical)
                _resolve_notification(db, user.id, dedup_warning)

                # ---- Success: achieved target ----
                # Only upsert a success if there was a resolved critical/warning (recovery)
                prev_critical = db.query(models.Notification).filter(
                    models.Notification.user_id == user.id,
                    models.Notification.dedup_key == dedup_critical,
                    models.Notification.status == "resolved",
                ).first()
                prev_warning = db.query(models.Notification).filter(
                    models.Notification.user_id == user.id,
                    models.Notification.dedup_key == dedup_warning,
                    models.Notification.status == "resolved",
                ).first()
                if prev_critical or prev_warning:
                    _upsert_notification(
                        db, user.id,
                        dedup_key=dedup_achieved,
                        n_type="Success",
                        category="Achievement",
                        title=f"Recovered: {s.name} is back to {pct:.1f}%!",
                        message=f"Great work! Your attendance for {s.name} is now above the {target}% target.",
                        action="Open Analytics",
                    )

            # ---- Warning: safe bunks running low (≤ 2) ----
            if pct >= target and safe_bunks <= 2 and s.total >= 5:
                _upsert_notification(
                    db, user.id,
                    dedup_key=dedup_low_safe,
                    n_type="Warning",
                    category="Attendance",
                    title=f"Safe Bunks Low: {s.name}",
                    message=f"Only {safe_bunks} safe bunk(s) remaining for {s.name}. Avoid missing classes.",
                    action="Open Subject",
                    related_subject_id=s.id,
                )
            elif safe_bunks > 2:
                _resolve_notification(db, user.id, dedup_low_safe)

        # ---- All subjects safe: overall success ----
        all_safe = all(
            (s.attended / s.total * 100) >= s.target_percentage if s.total > 0 else True
            for s in subjects
        )
        if all_safe and len(subjects) > 0:
            _upsert_notification(
                db, user.id,
                dedup_key="all_safe",
                n_type="Success",
                category="Achievement",
                title="All Subjects Above Target 🎉",
                message="You're in perfect standing across all subjects. Keep up the consistency!",
                action="Open Analytics",
            )
        else:
            _resolve_notification(db, user.id, "all_safe")

        # Enforce retention policy
        _enforce_retention(db, user.id, max_count=30)
        db.commit()

    except Exception as e:
        db.rollback()  # Only rollback notifications, not other data
        # Silently swallow – notifications must never break core features


# --- Notification Routes ---

@app.get("/api/notifications", response_model=schemas.NotificationListResponse)
def get_notifications(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Generate/refresh notifications based on current state
    generate_notifications(db, current_user)

    # Priority sort: Critical → Warning → Success → Info; newest first within same type
    type_order = {"Critical": 0, "Warning": 1, "Success": 2, "Info": 3}
    status_order = {"unread": 0, "read": 1, "resolved": 2}

    notifs = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == current_user.id)
        .all()
    )
    notifs.sort(key=lambda n: (
        status_order.get(n.status, 9),
        type_order.get(n.type, 9),
        -(n.created_at.timestamp() if n.created_at else 0)
    ))

    unread_count = sum(1 for n in notifs if n.status == "unread")
    return schemas.NotificationListResponse(
        notifications=notifs,
        unreadCount=unread_count,
    )


@app.put("/api/notifications/{notif_id}/read")
def read_notification(
    notif_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notif = (
        db.query(models.Notification)
        .filter(
            models.Notification.id == notif_id,
            models.Notification.user_id == current_user.id,
        )
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notif.status == "unread":
        notif.status = "read"
        notif.updated_at = datetime.utcnow()
        db.commit()
    return {"message": "Notification marked as read"}


@app.put("/api/notifications/read-all")
def read_all_notifications(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.status == "unread",
    ).update({"status": "read", "updated_at": datetime.utcnow()})
    db.commit()
    return {"message": "All notifications marked as read"}


@app.delete("/api/notifications/{notif_id}")
def delete_notification(
    notif_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notif = (
        db.query(models.Notification)
        .filter(
            models.Notification.id == notif_id,
            models.Notification.user_id == current_user.id,
        )
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
