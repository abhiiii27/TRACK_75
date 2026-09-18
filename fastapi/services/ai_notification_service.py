from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models import User
from services.notification_service import NotificationService

class AINotificationService:
    @staticmethod
    def process_triggers(db: Session, user: User, triggers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes raw triggers from NotificationRuleEngine and converts them into 
        user-friendly notifications, persisting them via NotificationService.
        """
        generated_notifications = []
        
        for trigger in triggers:
            reason = trigger["reason"]
            severity = trigger["severity"]
            subject_id = trigger["subject_id"]
            dedup_key = trigger["dedup_key"]
            meta = trigger.get("metadata", {})
            
            title = "AI Alert"
            message = "We have an update regarding your attendance."
            action = "View Details"
            
            if reason == "no_subjects":
                title = "Let's Get Started"
                message = "Add subjects to start receiving AI attendance insights."
                action = "Add Subject"
            
            elif reason == "attendance_below_goal":
                subject_name = meta.get("subject_name", "a subject")
                req_classes = meta.get("required_classes", 1)
                title = f"Critical Shortage: {subject_name}"
                class_word = "class" if req_classes == 1 else "classes"
                message = f"You need to attend the next {req_classes} {class_word} of {subject_name} to recover your attendance."
                action = "Open Subject"
                
            elif reason == "attendance_becoming_risky":
                subject_name = meta.get("subject_name", "a subject")
                safe_bunks = meta.get("safe_to_miss", 0)
                title = f"Risk Warning: {subject_name}"
                if safe_bunks > 0:
                    message = f"Your attendance is approaching the minimum target. You only have {safe_bunks} safe bunks left."
                else:
                    message = f"Your attendance is at the minimum target. You cannot miss any more classes."
                action = "Open Subject"
                
            elif reason == "safe_attendance":
                subject_name = meta.get("subject_name", "a subject")
                safe_bunks = meta.get("safe_to_miss", 5)
                title = f"Excellent: {subject_name}"
                message = f"Excellent! Your attendance is safely above your goal with {safe_bunks} safe bunks."
                action = "Open Subject"
                
            # Use existing NotificationService to create/upsert safely
            notif = NotificationService.create_notification(
                db=db,
                user_id=user.id,
                category="Attendance",
                type=severity,
                title=title,
                message=message,
                action=action,
                related_subject_id=subject_id,
                dedup_key=dedup_key
            )
            
            if notif:
                generated_notifications.append(notif)
                
        return generated_notifications
