import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv() 

EMAIL = os.getenv("EMAIL_HOST_USER")
PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

def send_welcome_email(username, recipient_email):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL
        msg['To'] = recipient_email
        msg['Subject'] = "Welcome to Daw's Cook 🍽"

        body = f"""
        Hi {username} 👋,

        Thank you for registering at Daw's Cook!
        We’re thrilled to have you on board.

        Happy cooking! 🍳

        — The Daw's Cook Team
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(os.getenv("EMAIL_HOST"), int(os.getenv("EMAIL_PORT")))
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"[✓] Email sent to {recipient_email}")
    except Exception as e:
        print("[!] Failed to send email:", e)
