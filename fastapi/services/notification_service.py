from sqlalchemy.orm import Session
from models import Notification, Subject, User
from typing import Optional
from datetime import datetime
import math

class NotificationService:
    @staticmethod
    def _enforce_retention_policy(db: Session, user_id: str):
        # Keep maximum 30 notifications per user.
        # Cleanup order: Oldest READ -> Oldest RESOLVED -> Oldest INFO -> Oldest SUCCESS -> Oldest WARNING. Never unread critical.
        total_count = db.query(Notification).filter(Notification.user_id == user_id).count()
        if total_count <= 30:
            return

        to_delete = total_count - 30
        
        # Priority mapping for cleanup: Read=0, Resolved=1, Unread Info=2, Unread Success=3, Unread Warning=4
        # We will fetch all, sort in Python, and delete the top `to_delete` items
        all_notifs = db.query(Notification).filter(Notification.user_id == user_id).all()
        
        def cleanup_priority(n: Notification):
            if n.status == "read": return 0
            if n.status == "resolved": return 1
            if n.status == "unread":
                if n.type == "Info": return 2
                if n.type == "Success": return 3
                if n.type == "Warning": return 4
                if n.type == "Critical": return 99 # never delete
            return 5
            
        all_notifs.sort(key=lambda n: (cleanup_priority(n), n.created_at.timestamp() if n.created_at else 0))
        
        for i in range(to_delete):
            if cleanup_priority(all_notifs[i]) == 99:
                break # We've hit unread criticals, stop deleting
            db.delete(all_notifs[i])
            
        db.commit()

    @staticmethod
    def create_notification(
        db: Session,
        user_id: str,
        category: str,
        type: str,
        title: str,
        message: str,
        action: Optional[str] = None,
        related_subject_id: Optional[str] = None,
        dedup_key: Optional[str] = None
    ) -> Optional[Notification]:
        try:
            # Prevent duplicates if dedup_key exists.
            if dedup_key:
                existing = db.query(Notification).filter(
                    Notification.user_id == user_id,
                    Notification.dedup_key == dedup_key,
                    Notification.status != "resolved"
                ).first()
                
                if existing:
                    # Update existing notification
                    existing.title = title
                    existing.message = message
                    existing.updated_at = datetime.utcnow()
                    existing.created_at = datetime.utcnow() # bump to top
                    existing.status = "unread"
                    db.commit()
                    db.refresh(existing)
                    return existing

            notif = Notification(
                user_id=user_id,
                category=category,
                type=type,
                title=title,
                message=message,
                action=action,
                related_subject_id=related_subject_id,
                dedup_key=dedup_key,
                status="unread"
            )
            db.add(notif)
            db.commit()
            db.refresh(notif)
            
            # Enforce retention policy
            NotificationService._enforce_retention_policy(db, user_id)
            
            return notif
        except Exception as e:
            # Revert any bad state caused by notification generation but let the outer transaction proceed
            db.rollback()
            print(f"Error generating notification: {e}")
            return None

    @staticmethod
    def check_attendance_triggers(db: Session, user: User, subject: Subject, old_pct: float, new_pct: float):
        try:
            target = subject.target_percentage
            target_frac = target / 100.0
            
            # 1. Attendance drops below target
            if old_pct >= target > new_pct or (old_pct < target and new_pct < old_pct):
                # Update logic ensures if it drops further, it updates existing
                NotificationService.create_notification(
                    db, user.id, "Attendance", "Critical",
                    f"Attendance Alert: {subject.name}",
                    f"Your attendance in {subject.name} dropped to {round(new_pct, 1)}%, which is below your target of {target}%.",
                    action="Open Subject", related_subject_id=subject.id,
                    dedup_key=f"drop_below_target_{subject.id}"
                )
                
            # 2. Attendance reaches/recovers target
            if old_pct < target <= new_pct:
                # Mark previous "drop_below" alert as resolved
                previous_alert = db.query(Notification).filter(
                    Notification.user_id == user.id,
                    Notification.dedup_key == f"drop_below_target_{subject.id}",
                    Notification.status != "resolved"
                ).first()
                if previous_alert:
                    previous_alert.status = "resolved"
                    db.commit()

                NotificationService.create_notification(
                    db, user.id, "Attendance", "Success",
                    f"Goal Reached: {subject.name}",
                    f"Great job! Your attendance in {subject.name} is now {round(new_pct, 1)}%, meeting your target.",
                    action="Open Subject", related_subject_id=subject.id,
                    dedup_key=f"reach_target_{subject.id}"
                )

            # 3. Safe bunks become low
            safe_to_miss = 0
            if new_pct >= target and target_frac > 0:
                safe_to_miss = max(0, math.floor((subject.attended - target_frac * subject.total) / target_frac))
                
            if safe_to_miss <= 2 and new_pct >= target:
                NotificationService.create_notification(
                    db, user.id, "Attendance", "Warning",
                    f"Low Safe Bunks: {subject.name}",
                    f"You only have {safe_to_miss} safe bunks left in {subject.name} before dropping below target.",
                    action="Open Subject", related_subject_id=subject.id,
                    dedup_key=f"low_safe_bunks_{subject.id}" # Removed safe_to_miss to ensure it updates same alert
                )
                
            # 4. Attendance improves significantly (e.g. +5%)
            if new_pct - old_pct >= 5.0:
                NotificationService.create_notification(
                    db, user.id, "Attendance", "Success",
                    f"Significant Improvement: {subject.name}",
                    f"Your attendance improved by {round(new_pct - old_pct, 1)}%. Keep it up!",
                    action="Open Subject", related_subject_id=subject.id,
                    dedup_key=f"significant_improvement_{subject.id}_{round(new_pct)}"
                )
                
            # 5. Attendance declines significantly (e.g. -5%)
            if old_pct - new_pct >= 5.0:
                NotificationService.create_notification(
                    db, user.id, "Attendance", "Warning",
                    f"Attendance Decline: {subject.name}",
                    f"Your attendance dropped by {round(old_pct - new_pct, 1)}%. Be careful!",
                    action="Open Subject", related_subject_id=subject.id,
                    dedup_key=f"significant_decline_{subject.id}_{round(new_pct)}"
                )
        except Exception as e:
            print(f"Error in check_attendance_triggers: {e}")

    @staticmethod
    def notify_new_user(db: Session, user: User):
        NotificationService.create_notification(
            db, user.id, "System", "Info",
            "Welcome to Track75!",
            "Your profile is set up. Add your first subject to start tracking your attendance.",
            action="Add Subject",
            dedup_key="welcome_new_user"
        )

    @staticmethod
    def notify_new_subject(db: Session, user_id: str, subject: Subject):
        NotificationService.create_notification(
            db, user_id, "System", "Info",
            "New Subject Added",
            f"You successfully added {subject.name}. Make sure to log your attendance regularly.",
            action="Open Subject", related_subject_id=subject.id,
            dedup_key=f"new_subject_{subject.id}"
        )
