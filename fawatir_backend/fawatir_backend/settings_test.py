import os

os.environ.setdefault("SECRET_KEY", "test-only-secret-key")
os.environ.setdefault("ALLOWED_HOSTS", "testserver,localhost")
from .settings import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}
