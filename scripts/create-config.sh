#!/bin/bash

# Create production config.json from environment variables
cat > src/assets/config/config.json << EOF
{
  "apiUrls": {
    "backend": "${API_URL}",
    "googleAuth": "${GOOGLE_CLIENT_ID}"
  },
  "production": true,
  "googleAuth": {
    "clientId": "${GOOGLE_CLIENT_ID}",
    "projectId": "${GOOGLE_PROJECT_ID}",
    "authUri": "${GOOGLE_AUTH_URI}",
    "tokenUri": "${GOOGLE_TOKEN_URI}",
    "authProviderX509CertUrl": "${GOOGLE_AUTH_PROVIDER_CERT_URL}",
    "clientSecret": "${GOOGLE_CLIENT_SECRET}",
    "javascriptOrigins": ["${FRONTEND_URL}"]
  },
  "featureFlags": {
    "enableProfileManagement": ${ENABLE_PROFILE_MANAGEMENT},
    "enableAnalytics": ${ENABLE_ANALYTICS},
    "enableAdvancedSearch": ${ENABLE_ADVANCED_SEARCH}
  },
  "app": {
    "name": "Rzume",
    "version": "${APP_VERSION}",
    "environment": "${ENVIRONMENT}"
  }
}
EOF

echo "Production config.json created successfully"
