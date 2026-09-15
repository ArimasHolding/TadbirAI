# -- Stage 1: build deps ------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /app

# System libs needed by psycopg2-binary & Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# -- Stage 2: runtime ---------------------------------------------------------
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy project source
COPY . .

# Collect static files (whitenoise serves them at runtime)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["sh", "/app/start.sh"]
