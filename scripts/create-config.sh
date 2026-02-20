#!/bin/bash

# Create production config.json from environment variables
cat > src/assets/config/config.json << EOF
{
  "apiUrls": {
    "backend": "${API_URL}",
    "googleAuth": "${GOOGLE_CLIENT_ID}"
  },
  "featureFlags": {
    "enableProfileManagement": "${PROFILE_MANAGEMENT_FEATURE}"
  },
  "analytics": {
    "mixpanelToken": "${MIXPANEL_TOKEN}",
    "enabled": ${ANALYTICS_ENABLED:-true}
  }
}
EOF

echo "Production config.json created successfully"
