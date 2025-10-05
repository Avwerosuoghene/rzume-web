# Step 1: Build Angular app
FROM node:20-alpine AS build

# Build arguments
ARG API_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_PROJECT_ID
ARG PROFILE_MANAGEMENT_FEATURE

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Create production config from environment variables
RUN mkdir -p src/assets/config
COPY scripts/create-config.sh ./create-config.sh
RUN apk add --no-cache bash dos2unix \
  && dos2unix /app/create-config.sh \
  && chmod +x /app/create-config.sh \
  && /app/create-config.sh

RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine

# Remove default nginx assets
RUN rm -rf /usr/share/nginx/html/*

# Copy your custom nginx config (already listening on 8080)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built Angular app
COPY --from=build /app/dist/rzume_web/browser /usr/share/nginx/html

# COPY --from=build /app/src/assets/config/config.json /usr/share/nginx/html/assets/config/config.json

RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx \
    && chown -R 1001:1001 /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html

# Expose 8080 (Cloud Run + your nginx.conf expect 8080)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]