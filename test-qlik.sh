#!/bin/bash

# Test Qlik provider through unified API
curl -s -X POST "http://localhost:3001/api/assistant/unified" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What is insurance?"}],
    "model": "quick",
    "stream": false,
    "resetThread": true
  }' | python3 -m json.tool