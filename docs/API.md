# Stellar Intelligence Platform - API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.stellar-ai.com
```

## Authentication
```http
Authorization: Bearer <token>
```
*Note: Authentication not yet implemented in demo*

## Endpoints

### 1. Submit Claim
Submit a new insurance claim for processing.

**Endpoint:** `POST /api/claims/submit`

**Request Body:**
```json
{
  "type": "commercial" | "residential",
  "propertyAddress": "string",
  "propertyType": "string",
  "policyNumber": "string (optional)",
  "damageType": "string",
  "damageDescription": "string (optional)",
  "severity": "Minor" | "Moderate" | "Major" | "Total Loss",
  "insuredName": "string",
  "insuredEmail": "email",
  "insuredPhone": "string",
  "images": [
    {
      "url": "string",
      "filename": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "claimId": "cuid",
    "claimNumber": "CP-2024-12345",
    "status": "SUBMITTED",
    "message": "Claim submitted successfully. Processing initiated.",
    "estimatedProcessingTime": "24 hours"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/claims/submit \
  -H "Content-Type: application/json" \
  -d '{
    "type": "commercial",
    "propertyAddress": "123 Main St, Dallas, TX 75201",
    "propertyType": "Office Building",
    "damageType": "Hurricane Wind Damage",
    "severity": "Major",
    "insuredName": "John Doe",
    "insuredEmail": "john@example.com",
    "insuredPhone": "214-555-0100"
  }'
```

### 2. Get Claim Status
Retrieve claim details and current status.

**Endpoint:** `GET /api/claims/submit?claimNumber={claimNumber}`

**Query Parameters:**
- `claimNumber` - The claim number (e.g., CP-2024-12345)
- `claimId` - Alternative: use claim ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "claimNumber": "CP-2024-12345",
    "type": "commercial",
    "status": "UNDER_REVIEW",
    "priority": "HIGH",
    "insuredName": "John Doe",
    "insuredEmail": "john@example.com",
    "propertyAddress": "123 Main St, Dallas, TX",
    "estimatedAmount": 285450,
    "aiConfidence": 0.92,
    "fraudScore": 0.12,
    "settlementScore": 0.88,
    "documents": [...],
    "workflows": [...],
    "activities": [...]
  }
}
```

### 3. Get Claim by ID
Get detailed information about a specific claim.

**Endpoint:** `GET /api/claims/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "claimNumber": "CP-2024-12345",
    "type": "commercial",
    "status": "ESTIMATING",
    "priority": "URGENT",
    "submittedAt": "2024-03-15T10:30:00Z",
    "updatedAt": "2024-03-15T11:15:00Z",
    "propertyAddress": "123 Main St, Dallas, TX",
    "estimatedAmount": 285450,
    "documents": [
      {
        "id": "doc1",
        "filename": "damage_photo_1.jpg",
        "url": "/uploads/damage_photo_1.jpg",
        "uploadedAt": "2024-03-15T10:30:00Z"
      }
    ],
    "workflows": [
      {
        "id": "wf1",
        "name": "claim-submission",
        "status": "COMPLETED",
        "triggeredAt": "2024-03-15T10:30:00Z"
      }
    ],
    "lead": {
      "id": "lead1",
      "leadNumber": "LEAD-123456",
      "status": "NEW",
      "qualification": "Hot"
    }
  }
}
```

### 4. Update Claim
Update claim information.

**Endpoint:** `PATCH /api/claims/{id}`

**Request Body:**
```json
{
  "status": "APPROVED",
  "approvedAmount": 275000,
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "claimNumber": "CP-2024-12345",
    "status": "APPROVED",
    "approvedAmount": 275000
  }
}
```

### 5. Admin Dashboard - Get Claims
Get paginated list of claims with filters.

**Endpoint:** `GET /api/admin/claims`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (SUBMITTED, TRIAGING, UNDER_REVIEW, etc.)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `type` - Filter by type (commercial, residential)
- `search` - Search by claim number, name, or email

**Response:**
```json
{
  "success": true,
  "data": {
    "claims": [
      {
        "id": "cuid",
        "claimNumber": "CP-2024-12345",
        "type": "commercial",
        "status": "UNDER_REVIEW",
        "priority": "HIGH",
        "insuredName": "John Doe",
        "insuredEmail": "john@example.com",
        "propertyAddress": "123 Main St",
        "estimatedAmount": 285450,
        "submittedAt": "2024-03-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    },
    "statistics": {
      "statusCounts": {
        "SUBMITTED": 5,
        "UNDER_REVIEW": 12,
        "APPROVED": 28
      },
      "totalEstimatedAmount": 1250000,
      "averageProcessingTime": "2.5 hours"
    }
  }
}
```

### 6. Bulk Update Claims
Update multiple claims at once.

**Endpoint:** `PATCH /api/admin/claims`

**Request Body:**
```json
{
  "claimIds": ["id1", "id2", "id3"],
  "updates": {
    "status": "UNDER_REVIEW",
    "priority": "HIGH"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": 3
  }
}
```

## Workflow Webhooks

### Webhook Events
The system sends webhooks for the following events:

- `claim.submitted` - New claim received
- `claim.triaged` - Priority assigned
- `claim.classified` - AI analysis complete
- `claim.estimated` - Estimate generated
- `claim.approved` - Claim approved
- `claim.denied` - Claim denied
- `claim.settled` - Settlement processed

### Webhook Payload
```json
{
  "event": "claim.estimated",
  "timestamp": "2024-03-15T11:00:00Z",
  "data": {
    "claimId": "cuid",
    "claimNumber": "CP-2024-12345",
    "estimatedAmount": 285450,
    "aiConfidence": 0.92
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "Validation error details"
  }
}
```

## Rate Limiting
*Note: Not yet implemented*

Future implementation will include:
- 100 requests per minute per API key
- 1000 requests per hour per API key
- Headers will include:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Claim Status Flow

```
SUBMITTED → TRIAGING → UNDER_REVIEW → ESTIMATING → APPROVED/DENIED → SETTLED → CLOSED
```

## Priority Levels
- `URGENT` - Immediate attention required (major damage, safety concerns)
- `HIGH` - Process within 4 hours
- `MEDIUM` - Process within 24 hours
- `LOW` - Process within 48 hours

## Damage Severity
- `Minor` - Cosmetic damage, fully functional
- `Moderate` - Some functionality impaired
- `Major` - Significant damage, major repairs needed
- `Total Loss` - Complete destruction

## Testing the API

### Using cURL
```bash
# Submit a claim
curl -X POST http://localhost:3000/api/claims/submit \
  -H "Content-Type: application/json" \
  -d @claim.json

# Get claims list
curl http://localhost:3000/api/admin/claims?status=UNDER_REVIEW&limit=20

# Get specific claim
curl http://localhost:3000/api/claims/CLAIM_ID_HERE
```

### Using Postman
Import the following collection:

```json
{
  "info": {
    "name": "Stellar Intelligence API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Submit Claim",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"type\": \"commercial\",\n  \"propertyAddress\": \"123 Main St\",\n  \"propertyType\": \"Office\",\n  \"damageType\": \"Wind\",\n  \"severity\": \"Major\",\n  \"insuredName\": \"Test User\",\n  \"insuredEmail\": \"test@example.com\",\n  \"insuredPhone\": \"555-0100\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/claims/submit",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "claims", "submit"]
        }
      }
    }
  ]
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
// Install: npm install @stellar/sdk
import { StellarClient } from '@stellar/sdk';

const client = new StellarClient({
  apiKey: 'YOUR_API_KEY',
  environment: 'development'
});

// Submit a claim
const claim = await client.claims.submit({
  type: 'commercial',
  propertyAddress: '123 Main St',
  propertyType: 'Office Building',
  damageType: 'Hurricane',
  severity: 'Major',
  insuredName: 'John Doe',
  insuredEmail: 'john@example.com',
  insuredPhone: '555-0100'
});

console.log(`Claim submitted: ${claim.claimNumber}`);
```

### Python
```python
# Install: pip install stellar-sdk
from stellar import Client

client = Client(
    api_key="YOUR_API_KEY",
    environment="development"
)

# Submit a claim
claim = client.claims.submit(
    type="commercial",
    property_address="123 Main St",
    property_type="Office Building",
    damage_type="Hurricane",
    severity="Major",
    insured_name="John Doe",
    insured_email="john@example.com",
    insured_phone="555-0100"
)

print(f"Claim submitted: {claim.claim_number}")
```