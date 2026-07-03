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
