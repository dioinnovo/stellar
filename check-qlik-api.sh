#!/bin/bash

# Qlik API credentials
QLIK_TENANT_URL="https://innovoco2.us.qlikcloud.com"
QLIK_API_KEY="eyJhbGciOiJFUzM4NCIsImtpZCI6ImU2NjQzNTM2LTJlNWMtNDZmZi1iYmMyLTcxNThiYjRhYzIwNSIsInR5cCI6IkpXVCJ9.eyJzdWJUeXBlIjoidXNlciIsInRlbmFudElkIjoiSC14WWVUVV96d2hsODRPLVJseUNEb1ZpLTRBUlJoT2siLCJqdGkiOiJlNjY0MzUzNi0yZTVjLTQ2ZmYtYmJjMi03MTU4YmI0YWMyMDUiLCJhdWQiOiJxbGlrLmFwaSIsImlzcyI6InFsaWsuYXBpL2FwaS1rZXlzIiwic3ViIjoiNjhiMGI4MWQ1OTNhY2E1ZWM2MTllOWZiIn0.NGQnAsvgqFIaTyTG1H1pXbTKXndxoOj5KgTU-_qofN5pFo8HabRgFMqmY_G58gJW5nX5UoIJ-Y0z1UOEmUw3BYFXglPel1Yizo6ZSdOycvvjhIOv0r8ddOMvDfur-zkO"

echo "=== Listing Qlik Assistants ==="
curl -s "${QLIK_TENANT_URL}/api/v1/assistants" \
  -H "Authorization: Bearer ${QLIK_API_KEY}" | python3 -m json.tool

echo ""
echo "=== Checking specific assistant ==="
ASSISTANT_ID="809c83c2-98ac-4fd8-bdcd-e9da6eb0513d"
curl -s "${QLIK_TENANT_URL}/api/v1/assistants/${ASSISTANT_ID}" \
  -H "Authorization: Bearer ${QLIK_API_KEY}" | python3 -m json.tool