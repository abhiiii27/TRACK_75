import os
import logging
from typing import Optional, List
import firebase_admin
from firebase_admin import credentials, messaging
from firebase_admin.exceptions import FirebaseError

logger = logging.getLogger(__name__)

def initialize_firebase():
    """
    Initializes the Firebase Admin SDK securely.
    It relies on GOOGLE_APPLICATION_CREDENTIALS set in the environment,
    or falls back to looking for firebase-adminsdk.json locally.
    """
    if not firebase_admin._apps:
        try:
            # Check if explicit path is set via standard env var
            cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
            else:
                # Fallback to local dev path if standard env var is missing
                # Use abspath to ensure reliable resolution regardless of working directory
                current_dir = os.path.dirname(os.path.abspath(__file__))
                fastapi_dir = os.path.dirname(current_dir)
                local_path = os.path.join(fastapi_dir, 'firebase-adminsdk.json')
                if os.path.exists(local_path):
                    cred = credentials.Certificate(local_path)
                else:
                    logger.warning("Firebase Admin SDK credentials not found. Notifications will be disabled.")
                    return
            
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {str(e)}")

def is_configured() -> bool:
    return len(firebase_admin._apps) > 0

def validate_token(token: str) -> bool:
    """
    Validates a device token by doing a dry run message.
    """
    if not is_configured():
        return False
        
    try:
        # A dummy message to test if the token is valid without actually sending
        message = messaging.Message(token=token)
        messaging.send(message, dry_run=True)
        return True
    except messaging.UnregisteredError:
        return False
    except FirebaseError as e:
        logger.error(f"Firebase token validation error: {str(e)}")
        # If it's another error, we might still want to keep the token just in case
        return True
    except Exception as e:
        logger.error(f"Unexpected token validation error: {str(e)}")
        return False

import uuid
from datetime import datetime

class NotificationService:
    @staticmethod
    def deactivate_invalid_token(db_session, token_str: str, reason: str):
        from models import DeviceToken
        try:
            db_token = db_session.query(DeviceToken).filter(DeviceToken.device_token == token_str).first()
            if db_token and db_token.is_active:
                db_token.is_active = False
                db_token.deactivated_reason = reason
                db_token.deactivated_at = datetime.utcnow()
                db_session.commit()
                logger.info(f"Deactivated token {token_str[:10]}... Reason: {reason}")
        except Exception as e:
            logger.error(f"Failed to deactivate token: {str(e)}")
            db_session.rollback()

    @staticmethod
    def send_multicast(db_session, tokens: List[str], title: str, body: str, icon: str = "/icon-192x192.png", data: Optional[dict] = None) -> dict:
        if not is_configured() or not tokens:
            return {
                "successCount": 0,
                "failureCount": 0,
                "successfulDevices": [],
                "failedDevices": [],
                "deactivatedTokens": []
            }

        # Ensure notificationId exists
        if not data:
            data = {}
        if "notificationId" not in data:
            data["notificationId"] = str(uuid.uuid4())

        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                    image=icon
                ),
                data=data,
                tokens=tokens,
            )
            
            print("[FCM-DELIVERY] Firebase configured = True")
            print(f"[FCM-DELIVERY] Token count = {len(tokens)}")
            print("[FCM-DELIVERY] Sending multicast")
            
            response = messaging.send_each_for_multicast(message)
            
            print(f"[FCM-DELIVERY] Success count = {response.success_count}")
            print(f"[FCM-DELIVERY] Failure count = {response.failure_count}")
            
            successful_devices = []
            failed_devices = []
            deactivated_tokens = []
            errors = []

            for idx, resp in enumerate(response.responses):
                token = tokens[idx]
                if resp.success:
                    successful_devices.append(token)
                else:
                    failed_devices.append(token)
                    # Handle specific invalid token errors
                    err_code = resp.exception.code if resp.exception else "unknown"
                    err_msg = str(resp.exception) if resp.exception else "Unknown error"
                    errors.append(err_msg)
                    print(f"[FCM-DELIVERY] Error code = {err_code}")
                    print(f"[FCM-DELIVERY] Error message = {err_msg}")
                    if err_code in ["registration-token-not-registered", "invalid-registration-token", "NOT_FOUND", "INVALID_ARGUMENT", "SENDER_ID_MISMATCH", "PERMISSION_DENIED"]:
                        NotificationService.deactivate_invalid_token(db_session, token, err_code)
                        deactivated_tokens.append(token)

            return {
                "successCount": response.success_count,
                "failureCount": response.failure_count,
                "successfulDevices": successful_devices,
                "failedDevices": failed_devices,
                "deactivatedTokens": deactivated_tokens,
                "error": " | ".join(errors) if errors else None
            }
        except Exception as e:
            logger.error(f"Multicast send error: {str(e)}")
            return {
                "successCount": 0,
                "failureCount": len(tokens),
                "successfulDevices": [],
                "failedDevices": tokens,
                "deactivatedTokens": [],
                "error": str(e)
            }

# Initialize immediately when module loads
initialize_firebase()
