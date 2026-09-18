import os
import time
from datetime import datetime
from pytz import timezone
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from database import SessionLocal
import models

# Import existing services
from services.notification_engine import NotificationRuleEngine
from services.ai_notification_service import AINotificationService
from services.notification_service import NotificationService
from services import firebase_service

# Configurable Interval
INTERVAL_MINUTES = int(os.getenv("NOTIFICATION_SCHEDULER_INTERVAL_MINUTES", "30"))
TZ = timezone('Asia/Kolkata')

# Global Scheduler Instance
scheduler = BackgroundScheduler(timezone=TZ)


def log_event(msg: str):
    print(f"[{datetime.now(TZ).isoformat()}] [SCHEDULER] {msg}")

def run_smart_notification_cycle():
    """
    Core execution cycle for background smart notifications.
    """
    start_time = time.time()
    log_event("Execution Started")
    
    db: Session = SessionLocal()
    try:
        users = db.query(models.User).filter(models.User.setup_complete == True).all()
        
        users_processed = 0
        users_skipped = 0
        notifications_generated = 0
        push_success_count = 0
        push_failure_count = 0
        invalid_tokens_removed = 0
        
        for user in users:
            # 1. Fetch Subjects & Active Device Tokens
            subjects = db.query(models.Subject).filter(models.Subject.owner_id == user.id).all()
            tokens = db.query(models.DeviceToken).filter(
                models.DeviceToken.user_id == user.id,
                models.DeviceToken.is_active == True
            ).all()
            
            # Skip conditions
            if not subjects or not tokens:
                users_skipped += 1
                continue
                
            users_processed += 1
            
            # 2. Execute Rule Engine
            triggers = NotificationRuleEngine.analyze_attendance(user, subjects)
            
            # 3. Execute AI Notification Service & Persist
            # AINotificationService internally calls NotificationService to safely upsert
            generated = AINotificationService.process_triggers(db, user, triggers)
            notifications_generated += len(generated)
            
            # 4. Fetch Unread Critical and Warning notifications for delivery
            # We fetch from DB instead of strictly using `generated` because some might have been bumped
            # back to unread, and we want to deliver them if they haven't been resolved.
            unread_alerts = db.query(models.Notification).filter(
                models.Notification.user_id == user.id,
                models.Notification.status == "unread",
                models.Notification.type.in_(["Critical", "Warning"])
            ).all()
            
            if not unread_alerts:
                continue
                
            # Deliver via Firebase
            token_strings = [t.token for t in tokens]
            
            # Combine unread alerts into one smart digest or send highest priority
            # We'll just send the most recent / highest priority one to prevent spamming
            type_order = {"Critical": 0, "Warning": 1}
            unread_alerts.sort(key=lambda n: (type_order.get(n.type, 9), -(n.created_at.timestamp() if n.created_at else 0)))
            target_alert = unread_alerts[0]
            
            payload = {
                "title": target_alert.title,
                "body": target_alert.message,
                "data": {
                    "action": target_alert.action or "",
                    "notification_id": str(target_alert.id),
                    "url": "/"
                }
            }
            
            success, failure, failed_tokens = firebase_service.send_multicast_message(token_strings, payload)
            push_success_count += success
            push_failure_count += failure
            
            # 5. Mark invalid tokens inactive
            if failed_tokens:
                for ft in failed_tokens:
                    db_token = db.query(models.DeviceToken).filter(models.DeviceToken.token == ft).first()
                    if db_token:
                        db_token.is_active = False
                        invalid_tokens_removed += 1
                db.commit()
                
    except Exception as e:
        log_event(f"Execution Error: {str(e)}")
    finally:
        db.close()
        
    duration = time.time() - start_time
    scheduler._last_run = datetime.now(TZ).isoformat()
    
    log_event(f"Users Processed: {users_processed} | Users Skipped: {users_skipped}")
    log_event(f"Notifications Generated: {notifications_generated}")
    log_event(f"Push Success: {push_success_count} | Push Failure: {push_failure_count}")
    log_event(f"Invalid Tokens Removed: {invalid_tokens_removed}")
    log_event(f"Execution Completed in {duration:.2f}s")


def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            run_smart_notification_cycle, 
            'interval', 
            minutes=INTERVAL_MINUTES,
            id='smart_notification_job',
            replace_existing=True
        )
        scheduler.start()
        log_event("Scheduler Started")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        log_event("Scheduler Stopped")

def get_status():
    job = scheduler.get_job('smart_notification_job')
    next_run = job.next_run_time.isoformat() if job and job.next_run_time else None
    return {
        'status': 'running' if scheduler.running else 'stopped',
        'last_run': getattr(scheduler, '_last_run', None),
        'next_run': next_run,
        'interval_minutes': INTERVAL_MINUTES
    }
