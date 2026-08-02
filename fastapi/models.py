from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    college_name = Column(String, nullable=True)
    department = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    attendance_goal = Column(Integer, default=75)
    setup_complete = Column(Boolean, default=False)

    subjects = relationship("Subject", back_populates="owner", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="owner", cascade="all, delete-orphan")
    devices = relationship("DeviceToken", back_populates="owner", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, nullable=False)
    attended = Column(Integer, default=0)
    total = Column(Integer, default=0)
    target_percentage = Column(Integer, default=75)
    
    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User", back_populates="subjects")
    attendance_records = relationship("AttendanceRecord", back_populates="subject", cascade="all, delete-orphan")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False)  # "present" or "absent"
    date = Column(String, nullable=False)  # YYYY-MM-DD
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="attendance_records")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    # type: "Critical" | "Warning" | "Success" | "Info"
    # (maps to frontend type for colour/icon)
    type = Column(String, nullable=False)
    # category: "Attendance" | "System" | "Achievement"
    category = Column(String, nullable=False, default="Attendance")
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    action = Column(String, nullable=True)          # e.g. "Open Subject"
    related_subject_id = Column(String, nullable=True)
    # dedup_key: unique per-user lifecycle key; used to upsert instead of insert
    # e.g. "critical:subj-abc123" or "no_subjects"
    dedup_key = Column(String, nullable=True, index=True)
    # status: "unread" | "read" | "resolved"
    status = Column(String, default="unread", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="notifications")

class DeviceToken(Base):
    __tablename__ = "device_tokens"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    device_token = Column(String, unique=True, index=True, nullable=False)
    platform = Column(String, nullable=True)     # e.g., "web", "android", "ios"
    browser = Column(String, nullable=True)      # e.g., "Chrome", "Safari"
    user_agent = Column(String, nullable=True)   # Raw user agent string
    device_name = Column(String, nullable=True)  # e.g., "Abhishek's MacBook"
    is_active = Column(Boolean, default=True, nullable=False)
    deactivated_reason = Column(String, nullable=True)
    deactivated_at = Column(DateTime, nullable=True)
    
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="devices")
