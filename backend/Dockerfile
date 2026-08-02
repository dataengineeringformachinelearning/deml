# DEML Django control plane — Python 3.12 (matches CI).
# Context: backend/ after staging contracts from monorepo root:
#   npm run sync:contracts:docker
#   cd backend && fly deploy
#
# Catalog pin: config/deml.catalog.json → python.version
FROM python:3.12-slim-bookworm AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ python3-dev cmake ninja-build libssl-dev git \
    && rm -rf /var/lib/apt/lists/*

# Build and install liboqs (C library) required by liboqs-python
RUN git clone --branch 0.15.0 --depth 1 https://github.com/open-quantum-safe/liboqs.git /tmp/liboqs && \
    cd /tmp/liboqs && \
    mkdir build && cd build && \
    cmake -GNinja -DOQS_USE_OPENSSL=ON -DBUILD_SHARED_LIBS=ON -DCMAKE_INSTALL_PREFIX=/opt/oqs .. && \
    ninja && ninja install

ENV LD_LIBRARY_PATH="/opt/oqs/lib" \
    C_INCLUDE_PATH="/opt/oqs/include" \
    CPLUS_INCLUDE_PATH="/opt/oqs/include" \
    LIBRARY_PATH="/opt/oqs/lib"

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# --- Shared contracts SoT (staged vendor/ or monorepo packages/) ---
COPY vendor/deml-contracts /packages/deml-contracts
RUN pip install --no-cache-dir /packages/deml-contracts

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN DATABASE_URL=sqlite:////tmp/collectstatic.db \
    SECRET_KEY=collectstatic-build-only \
    DEBUG=false \
    python manage.py collectstatic --noinput --clear

# --- Slim runtime (non-root 1001; pins match CI Python 3.12) ---
FROM python:3.12-slim-bookworm AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl3 ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 1001 deml \
    && useradd --uid 1001 --gid deml --shell /usr/sbin/nologin --create-home deml

COPY --from=builder /opt/oqs /opt/oqs
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    LD_LIBRARY_PATH="/opt/oqs/lib" \
    PORT=8080

WORKDIR /app
USER 1001

EXPOSE 8000 8080

# Liveness/readiness: GET /api/v1/health · GET /api/v1/ready (catalog health.*)
CMD ["python", "start.py"]
