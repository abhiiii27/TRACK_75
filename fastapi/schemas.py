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

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    attended: Optional[int] = Field(None, ge=0)
    total: Optional[int] = Field(None, ge=0)
    targetPercentage: Optional[int] = Field(None, ge=0, le=100)

class SubjectResponse(SubjectBase):
    id: str

    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceLog(BaseModel):
    subjectId: str
    status: str = Field(..., pattern="^(present|absent)$")

class AttendanceUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(present|absent)$")
    notes: Optional[str] = None

class AttendanceRecordResponse(BaseModel):
    id: str
    subjectId: str
    subjectName: str
    status: str
    date: str
    notes: Optional[str] = None

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

# Analytics Schemas
class WeeklySummary(BaseModel):
    percentage: float
    attended: int
    missed: int
    totalClasses: int
    comparison: str
    status: str

class MonthlySummary(BaseModel):
    percentage: float
    attended: int
    missed: int
    totalClasses: int
    comparison: str
    status: str

class SubjectComparison(BaseModel):
    name: str
    percentage: float
    attended: int
    missed: int
    totalClasses: int
    safeBunks: int
    requiredClasses: int

class GoalProgress(BaseModel):
    targetAttendance: int
    currentAttendance: float
    remainingClasses: int
    safeBunks: int

class TrendData(BaseModel):
    name: str
    Percentage: float

class WeeklyGraphData(BaseModel):
    name: str
    Attended: int
    Missed: int

class MonthlyGraphData(BaseModel):
    name: str
    Percentage: float

class HeatmapWeek(BaseModel):
    week: str
    days: List[str]

class SmartInsights(BaseModel):
    bestSubject: str
    worstSubject: str
    highestAttendance: float
    lowestAttendance: float
    mostMissedSubject: str
    mostConsistentSubject: str
    averageAttendance: float
    highestAttendanceDay: str
    lowestAttendanceDay: str

class FutureAI(BaseModel):
    riskScore: float
    aiRecommendations: List[str]
    smartNotifications: List[str]

class AnalyticsResponse(BaseModel):
    weeklySummary: WeeklySummary
    monthlySummary: MonthlySummary
    subjectComparison: List[SubjectComparison]
    goalProgress: GoalProgress
    attendanceTrend: str
    trendData: List[TrendData]
    weeklyGraphData: List[WeeklyGraphData]
    monthlyGraphData: List[MonthlyGraphData]
    heatmapWeeks: List[HeatmapWeek]
    smartInsights: SmartInsights
    futureAI: FutureAI

class AIPredictionResponse(BaseModel):
    currentPercentage: float
    predictedPercentage: float
    riskScore: int
    riskLevel: str
    safeBunksRemaining: int
    requiredClasses: int
    attendanceTrend: str
    confidenceScore: str
    aiInsight: str


class PriorityTask(BaseModel):
    id: str
    title: str
    priority: str
    action: str
    reason: str

class AIRecommendationResponse(BaseModel):
    todayFocus: str
    weakestSubject: str
    strongestSubject: str
    attendanceSummary: str
    motivationMessage: str
    recoveryPlan: List[str]
    priorityTasks: List[PriorityTask]

