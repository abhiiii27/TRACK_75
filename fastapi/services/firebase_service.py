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
                local_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'firebase-adminsdk.json')
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

def delete_invalid_token(db_session, device_token_str: str):
    """
    Helper to mark a token as inactive in DB (avoid permanent deletion to keep audit).
    Needs to import models inline to prevent circular imports if necessary.
    """
    from models import DeviceToken
    try:
        db_token = db_session.query(DeviceToken).filter(DeviceToken.device_token == device_token_str).first()
        if db_token:
            db_token.is_active = False
            db_session.commit()
    except Exception as e:
        logger.error(f"Failed to deactivate invalid token: {str(e)}")

def send_notification(token: str, title: str, body: str, data: Optional[dict] = None) -> bool:
    """
    Sends a push notification to a single device token.
    """
    if not is_configured():
        return False

    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data if data else {},
            token=token,
        )
        messaging.send(message)
        return True
    except messaging.UnregisteredError:
        logger.info(f"Token unregistered: {token}")
        return False
    except FirebaseError as e:
        logger.error(f"Firebase send error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected send error: {str(e)}")
        return False

def send_multicast_notification(tokens: List[str], title: str, body: str, data: Optional[dict] = None) -> List[str]:
    """
    Sends a push notification to multiple tokens.
    Returns a list of failed tokens (e.g. unregistered ones).
    """
    if not is_configured() or not tokens:
        return []

    try:
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data if data else {},
            tokens=tokens,
        )
        response = messaging.send_each_for_multicast(message)
        
        failed_tokens = []
        if response.failure_count > 0:
            responses = response.responses
            for idx, resp in enumerate(responses):
                if not resp.success:
                    # e.g., UnregisteredError means token is no longer valid
                    failed_tokens.append(tokens[idx])
        return failed_tokens
    except Exception as e:
        logger.error(f"Multicast send error: {str(e)}")
        return []

# Initialize immediately when module loads
initialize_firebase()
