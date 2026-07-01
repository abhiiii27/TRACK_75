from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

# User Schemas
class UserCreate(BaseModel):
    fullName: str
    email: EmailStr
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileSetup(BaseModel):
    collegeName: str
    department: str
    semester: str
    attendanceGoal: int = Field(75, ge=50, le=100)

class UserResponse(BaseModel):
    id: str
    fullName: str = Field(validation_alias="full_name")
    email: str
    collegeName: Optional[str] = Field(default=None, validation_alias="college_name")
    department: Optional[str] = None
    semester: Optional[str] = None
    attendanceGoal: int = Field(default=75, validation_alias="attendance_goal")
    setupComplete: bool = Field(default=False, validation_alias="setup_complete")

    class Config:
        from_attributes = True
        populate_by_name = True

# Subject Schemas
class SubjectBase(BaseModel):
    name: str
    attended: int = Field(0, ge=0)
    total: int = Field(0, ge=0)
    targetPercentage: int = Field(75, ge=0, le=100)

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: str

    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceLog(BaseModel):
    subjectId: str
    status: str = Field(..., pattern="^(present|absent)$")

class PredictionInput(BaseModel):
    subjectId: str
    upcomingClasses: int = Field(5, ge=1, le=50)
    expectedAttendanceRate: int = Field(80, ge=0, le=100)

class PredictionResult(BaseModel):
    subjectId: str
    currentPercentage: float
    predictedPercentage: float
    targetPercentage: int
    requiredConsecutiveClasses: int
    safeToMissClasses: int
    status: str
    message: str
