from typing import List, Dict, Any
from models import User, Subject
import math

class NotificationRuleEngine:
    @staticmethod
    def analyze_attendance(user: User, subjects: List[Subject]) -> List[Dict[str, Any]]:
        """
        Analyzes the attendance data and generates raw notification triggers.
        Does NOT generate user-facing text or interact with the database.
        """
        triggers = []
        
        if not subjects:
            triggers.append({
                "reason": "no_subjects",
                "severity": "Info",
                "subject_id": None,
                "dedup_key": "ai_info_no_subjects",
                "metadata": {}
            })
            return triggers

        for subject in subjects:
            if subject.total == 0:
                continue

            current_pct = (subject.attended / subject.total) * 100
            target_pct = subject.target_percentage
            target_frac = target_pct / 100.0
            
            # Rule 1: Attendance below target (Critical)
            if current_pct < target_pct:
                required_classes = 0
                temp_attended = subject.attended
                temp_total = subject.total
                while (temp_attended / temp_total) * 100 < target_pct:
                    temp_attended += 1
                    temp_total += 1
                    required_classes += 1
                
                triggers.append({
                    "reason": "attendance_below_goal",
                    "severity": "Critical",
                    "subject_id": subject.id,
                    "dedup_key": f"ai_critical_below_{subject.id}",
                    "metadata": {
                        "current_pct": current_pct,
                        "target_pct": target_pct,
                        "required_classes": required_classes,
                        "subject_name": subject.name
                    }
                })
                continue # Skip warning/success if critical

            # Rule 2: Attendance near goal / Low safe bunks (Warning)
            safe_to_miss = 0
            if current_pct >= target_pct and target_frac > 0:
                safe_to_miss = math.floor((subject.attended - target_frac * subject.total) / target_frac)
                
            if safe_to_miss <= 2:
                triggers.append({
                    "reason": "attendance_becoming_risky",
                    "severity": "Warning",
                    "subject_id": subject.id,
                    "dedup_key": f"ai_warning_risky_{subject.id}",
                    "metadata": {
                        "current_pct": current_pct,
                        "target_pct": target_pct,
                        "safe_to_miss": safe_to_miss,
                        "subject_name": subject.name
                    }
                })
                continue
            
            # Rule 3: Safe attendance (Success)
            if safe_to_miss >= 5:
                 triggers.append({
                    "reason": "safe_attendance",
                    "severity": "Success",
                    "subject_id": subject.id,
                    "dedup_key": f"ai_success_safe_{subject.id}",
                    "metadata": {
                        "current_pct": current_pct,
                        "safe_to_miss": safe_to_miss,
                        "subject_name": subject.name
                    }
                })

        return triggers
