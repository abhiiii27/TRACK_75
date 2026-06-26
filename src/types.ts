export interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
  targetPercentage: number; // e.g. 75
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
  notes?: string;
}

export interface PredictionInput {
  subjectId: string;
  upcomingClasses: number;
  expectedAttendanceRate: number; // 0 to 100 percentage
}

export interface PredictionResult {
  subjectId: string;
  currentPercentage: number;
  predictedPercentage: number;
  targetPercentage: number;
  requiredConsecutiveClasses: number; // classes to attend to reach target
  safeToMissClasses: number; // classes that can be missed without falling below target
  status: 'safe' | 'at_risk' | 'critical';
  message: string;
}
