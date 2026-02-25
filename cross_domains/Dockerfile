# ---- Production Dockerfile ----
FROM node:20-alpine AS base

# Install static server
RUN npm install -g serve@14

WORKDIR /app

# Copy static assets (for prod docker build)
COPY public/ /app/

USER node

EXPOSE 5000
CMD ["serve", "-s", "/app", "-l", "5000"]