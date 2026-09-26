import requests
from django.conf import settings
from django.core.mail import send_mail


class EmailConfigurationError(RuntimeError):
    pass


def send_transactional_email(subject, text_content, recipients, html_content=None):
    """Send through Brevo in production, with Django backends available for tests/local use."""
    if settings.EMAIL_BACKEND != 'django.core.mail.backends.smtp.EmailBackend':
        return send_mail(
            subject, text_content, settings.DEFAULT_FROM_EMAIL, recipients,
            html_message=html_content, fail_silently=False,
        )

    api_key = getattr(settings, 'BREVO_API_KEY', '')
    sender_email = getattr(settings, 'BREVO_SENDER', '')
    sender_name = getattr(settings, 'BREVO_SENDER_NAME', 'Tadbir AI')
    if api_key:
        if not sender_email:
            raise EmailConfigurationError('BREVO_SENDER is required when BREVO_API_KEY is configured.')
        payload = {
            'sender': {'name': sender_name, 'email': sender_email},
            'to': [{'email': recipient} for recipient in recipients],
            'subject': subject,
            'textContent': text_content,
        }
        if html_content:
            payload['htmlContent'] = html_content
        response = requests.post(
            'https://api.brevo.com/v3/smtp/email',
            headers={'accept': 'application/json', 'api-key': api_key, 'content-type': 'application/json'},
            json=payload,
            timeout=getattr(settings, 'EMAIL_TIMEOUT', 15),
        )
        response.raise_for_status()
        return 1

    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        raise EmailConfigurationError('Brevo or SMTP credentials are required.')
    return send_mail(
        subject, text_content, settings.DEFAULT_FROM_EMAIL, recipients,
        html_message=html_content, fail_silently=False,
    )
