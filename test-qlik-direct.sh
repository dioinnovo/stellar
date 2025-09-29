#!/bin/bash

QLIK_TENANT_URL="https://innovoco2.us.qlikcloud.com"
QLIK_API_KEY="eyJhbGciOiJFUzM4NCIsImtpZCI6ImU2NjQzNTM2LTJlNWMtNDZmZi1iYmMyLTcxNThiYjRhYzIwNSIsInR5cCI6IkpXVCJ9.eyJzdWJUeXBlIjoidXNlciIsInRlbmFudElkIjoiSC14WWVUVV96d2hsODRPLVJseUNEb1ZpLTRBUlJoT2siLCJqdGkiOiJlNjY0MzUzNi0yZTVjLTQ2ZmYtYmJjMi03MTU4YmI0YWMyMDUiLCJhdWQiOiJxbGlrLmFwaSIsImlzcyI6InFsaWsuYXBpL2FwaS1rZXlzIiwic3ViIjoiNjhiMGI4MWQ1OTNhY2E1ZWM2MTllOWZiIn0.NGQnAsvgqFIaTyTG1H1pXbTKXndxoOj5KgTU-_qofN5pFo8HabRgFMqmY_G58gJW5nX5UoIJ-Y0z1UOEmUw3BYFXglPel1Yizo6ZSdOycvvjhIOv0r8ddOMvDfur-zkO"
ASSISTANT_ID="809c83c2-98ac-4fd8-bdcd-e9da6eb0513d"

# Create a thread
echo "Creating thread..."
THREAD_RESPONSE=$(curl -s -X POST \
  "${QLIK_TENANT_URL}/api/v1/assistants/${ASSISTANT_ID}/threads" \
  -H "Authorization: Bearer ${QLIK_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test-Thread"}')

echo "Thread Response:"
echo "$THREAD_RESPONSE" | python3 -m json.tool

# Extract thread ID
THREAD_ID=$(echo "$THREAD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

if [ -z "$THREAD_ID" ]; then
  echo "Failed to create thread"
  exit 1
fi

echo ""
echo "Thread ID: $THREAD_ID"
echo ""

# Send a message using different field names to test
echo "Testing with 'prompt' field..."
curl -s -X POST \
  "${QLIK_TENANT_URL}/api/v1/assistants/${ASSISTANT_ID}/threads/${THREAD_ID}/actions/invoke" \
  -H "Authorization: Bearer ${QLIK_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is insurance?"}' | python3 -m json.tool

echo ""
echo "Testing with 'query' field..."
curl -s -X POST \
  "${QLIK_TENANT_URL}/api/v1/assistants/${ASSISTANT_ID}/threads/${THREAD_ID}/actions/invoke" \
  -H "Authorization: Bearer ${QLIK_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is insurance?"}' | python3 -m json.tool

echo ""
echo "Testing with 'message' field..."
curl -s -X POST \
  "${QLIK_TENANT_URL}/api/v1/assistants/${ASSISTANT_ID}/threads/${THREAD_ID}/actions/invoke" \
  -H "Authorization: Bearer ${QLIK_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is insurance?"}' | python3 -m json.tool