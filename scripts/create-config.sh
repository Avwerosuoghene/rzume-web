#!/bin/bash

# Create production config.json from environment variables
cat > src/assets/config/config.json << EOF
{
  "apiUrls": {
    "backend": "${API_URL}",
    "googleAuth": "${GOOGLE_CLIENT_ID}"
  },
  "featureFlags": {
    "enableProfileManagement": false,
  }
}
EOF

echo "Production config.json created successfully"
