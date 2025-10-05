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
  }
}
EOF

echo "Production config.json created successfully"
