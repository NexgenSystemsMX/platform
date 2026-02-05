# Huly Frontend Docker Image
# This Dockerfile packages the pre-built frontend artifacts
# Build is done by the GitHub Actions workflow using Rush before Docker build

FROM node:22-bookworm-slim

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the pre-built artifacts (built by workflow)
COPY bundle/bundle.js ./
COPY bundle/bundle.js.map ./
COPY dist/ ./dist/

# Install sharp (external dependency not included in bundle)
RUN npm install sharp@0.34.3

# Create a non-root user for security
RUN groupadd -r huly && useradd -r -g huly huly
RUN chown -R huly:huly /app
USER huly

EXPOSE 8080

CMD [ "node", "./bundle.js" ]
