# Multi-stage Dockerfile for Huly Frontend
# This Dockerfile is self-contained and builds the entire frontend from source
# Context should be the repository root (not pods/front)

# =============================================================================
# Stage 1: Builder - Install dependencies and build the frontend
# =============================================================================
FROM node:22-bookworm-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy Rush configuration first (for better layer caching)
COPY rush.json ./
COPY .nvmrc ./
COPY common/ ./common/

# Copy all source directories needed for the build
# These are all the monorepo packages that the frontend depends on
COPY packages/ ./packages/
COPY models/ ./models/
COPY plugins/ ./plugins/
COPY server/ ./server/
COPY server-plugins/ ./server-plugins/
COPY pods/ ./pods/
COPY services/ ./services/
COPY dev/ ./dev/
COPY templates/ ./templates/
COPY foundations/ ./foundations/
COPY desktop/ ./desktop/

# Copy test directories (some have dependencies)
COPY tests/ ./tests/
COPY qms-tests/ ./qms-tests/
COPY ws-tests/ ./ws-tests/

# Ensure version.txt has the correct version
RUN echo '"0.7.330"' > common/scripts/version.txt

# Install Rush globally
RUN npm install -g @microsoft/rush@5.158.1

# Install all dependencies (this will take a while on first run)
RUN rush install --purge

# Build all packages in the monorepo
RUN rush build

# Bundle UI packages (creates the webpack bundles)
RUN rush bundle

# Package the production build (generates dist with all static assets)
WORKDIR /build/dev/prod
RUN node ../../common/scripts/install-run-rushx.js package

# Package the frontend pod (copies dist and creates the server bundle)
WORKDIR /build/pods/front
RUN node ../../common/scripts/install-run-rushx.js bundle
RUN node ../../common/scripts/install-run-rushx.js package

# =============================================================================
# Stage 2: Runtime - Minimal image with only the built artifacts
# =============================================================================
FROM node:22-bookworm-slim AS runtime

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the built artifacts from the builder stage
COPY --from=builder /build/pods/front/bundle/bundle.js ./
COPY --from=builder /build/pods/front/bundle/bundle.js.map ./
COPY --from=builder /build/pods/front/dist/ ./dist/

# Create a non-root user for security
RUN groupadd -r huly && useradd -r -g huly huly
RUN chown -R huly:huly /app
USER huly

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

CMD [ "node", "./bundle.js" ]
