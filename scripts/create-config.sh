#!/bin/bash

# Create production config.json from environment variables
cat > src/assets/config/config.json << EOF
{
  "apiUrls": {
    "backend": "${API_URL}",
    "googleAuth": "${GOOGLE_CLIENT_ID}"
  },
  "mixpanelToken": "${MIXPANEL_TOKEN}",
  "featureFlags": {
    "enableProfileManagement": "${PROFILE_MANAGEMENT_FEATURE}",
    "analyticsEnabled": "${ANALYTICS_ENABLED:-true}"
  }
}
EOF

echo "Production config.json created successfully"
