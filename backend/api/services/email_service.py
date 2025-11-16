import os
from dataclasses import dataclass
from typing import List, Optional
from django.core.mail import get_connection, EmailMessage

@dataclass
class SmtpConfig:
    host: str
    port: int
    user: str
    password: str
    use_tls: bool = True
    use_ssl: bool = False
    from_email: Optional[str] = None
    backend: str = "django.core.mail.backends.smtp.EmailBackend"

    @staticmethod
    def from_env() -> "SmtpConfig":
        return SmtpConfig(
            host=os.getenv("EMAIL_HOST", "smtp.gmail.com"),
            port=int(os.getenv("EMAIL_PORT", "587")),
            user=os.getenv("EMAIL_HOST_USER", ""),
            password=os.getenv("EMAIL_HOST_PASSWORD", ""),
            use_tls=os.getenv("EMAIL_USE_TLS", "true").lower() in ("1", "true", "yes"),
            use_ssl=os.getenv("EMAIL_USE_SSL", "false").lower() in ("1", "true", "yes"),
            from_email=os.getenv("DEFAULT_FROM_EMAIL", os.getenv("EMAIL_HOST_USER", "")),
            backend=os.getenv("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend"),
        )

class EmailService:
    def __init__(self, cfg: Optional[SmtpConfig] = None):
        self.cfg = cfg or SmtpConfig.from_env()

    def send(self, subject: str, body: str, to: List[str]) -> None:
        conn = get_connection(
            backend=self.cfg.backend,
            host=self.cfg.host,
            port=self.cfg.port,
            username=self.cfg.user,
            password=self.cfg.password,
            use_tls=self.cfg.use_tls,
            use_ssl=self.cfg.use_ssl,
        )
        EmailMessage(
            subject=subject,
            body=body,
            from_email=self.cfg.from_email or self.cfg.user,
            to=to,
            connection=conn,
        ).send(fail_silently=False)
