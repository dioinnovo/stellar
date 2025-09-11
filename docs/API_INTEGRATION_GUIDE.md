# Stellar Intelligence Platform
## API Integration Guide

### Quick Start Integration

The Stellar Intelligence Platform provides a comprehensive RESTful API and real-time WebSocket connections for seamless integration with existing workflows and systems.

---

## 🚀 Getting Started

### Authentication

All API requests require authentication using Bearer tokens obtained through OAuth 2.0 flow.

```typescript
// Authentication Headers
const headers = {
  'Authorization': 'Bearer YOUR_API_TOKEN',
  'Content-Type': 'application/json',
  'X-API-Version': 'v1'
}

// Example authentication request
const authenticate = async () => {
  const response = await fetch('https://api.stellar.ai/v1/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STELLAR_CLIENT_ID,
      client_secret: process.env.STELLAR_CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'inspections:read inspections:write ai:analyze'
    })
  })
  
  const { access_token, expires_in } = await response.json()
  return access_token
}
```

### Base Configuration

```typescript
const STELLAR_API_CONFIG = {
  baseURL: 'https://api.stellar.ai/v1',
  timeout: 30000,
  retries: 3,
  headers: {
    'Authorization': `Bearer ${process.env.STELLAR_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
}
```

---

## 🔍 Inspection Management API

### Create New Inspection

```typescript
interface CreateInspectionRequest {
  property: {
    address: string
    type: 'residential' | 'commercial'
    yearBuilt?: number
    squareFootage?: number
    ownerName: string
    ownerContact: string
  }
  claim: {
    claimNumber?: string
    dateOfLoss: string
    damageTypes: string[]
    initialEstimate?: number
    carrierName?: string
    policyNumber?: string
  }
  inspector: {
    inspectorId: string
    scheduledDate: string
    estimatedDuration: number // hours
  }
  metadata?: Record<string, any>
}

// Create inspection
const createInspection = async (data: CreateInspectionRequest) => {
  const response = await fetch(`${STELLAR_API_CONFIG.baseURL}/inspections`, {
    method: 'POST',
    headers: STELLAR_API_CONFIG.headers,
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error(`Failed to create inspection: ${response.statusText}`)
  }
  
  return response.json()
}

// Example usage
const inspection = await createInspection({
  property: {
    address: "1234 Ocean Drive, Miami Beach, FL 33101",
    type: "residential",
    yearBuilt: 2005,
    squareFootage: 2400,
    ownerName: "Johnson Properties LLC",
    ownerContact: "john@johnsonproperties.com"
  },
  claim: {
    claimNumber: "CLM-2024-001",
    dateOfLoss: "2024-03-15",
    damageTypes: ["Hurricane", "Water", "Wind"],
    initialEstimate: 165000,
    carrierName: "State Farm",
    policyNumber: "SF-123456789"
  },
  inspector: {
    inspectorId: "usr_inspector_001",
    scheduledDate: "2024-03-20T10:00:00Z",
    estimatedDuration: 4
  }
})

console.log('Inspection created:', inspection.id)
```

### Upload Inspection Images

```typescript
// Upload images with progress tracking
const uploadInspectionImages = async (inspectionId: string, files: File[]) => {
  const formData = new FormData()
  
  files.forEach((file, index) => {
    formData.append(`image_${index}`, file)
  })
  
  formData.append('inspectionId', inspectionId)
  formData.append('imageType', 'standard') // 'standard' | 'thermal' | '360'
  
  const response = await fetch(`${STELLAR_API_CONFIG.baseURL}/inspections/${inspectionId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': STELLAR_API_CONFIG.headers.Authorization
      // Don't set Content-Type for FormData
    },
    body: formData
  })
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }
  
  return response.json()
}

// Upload with progress tracking
const uploadWithProgress = async (inspectionId: string, files: File[]) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    
    files.forEach((file, index) => {
      formData.append(`image_${index}`, file)
    })
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        console.log(`Upload progress: ${Math.round(progress)}%`)
      }
    }
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`))
      }
    }
    
    xhr.open('POST', `${STELLAR_API_CONFIG.baseURL}/inspections/${inspectionId}/images`)
    xhr.setRequestHeader('Authorization', STELLAR_API_CONFIG.headers.Authorization)
    xhr.send(formData)
  })
}
```

---

## 🤖 AI Analysis API

### Trigger AI Analysis

```typescript
interface AIAnalysisRequest {
  inspectionId: string
  analysisTypes: ('damage_detection' | 'cost_estimation' | 'risk_assessment' | 'claims_intelligence')[]
  options?: {
    includeHiddenDamage?: boolean
    generateReport?: boolean
    priority?: 'low' | 'normal' | 'high'
  }
}

const triggerAIAnalysis = async (request: AIAnalysisRequest) => {
  const response = await fetch(`${STELLAR_API_CONFIG.baseURL}/ai/analyze`, {
    method: 'POST',
    headers: STELLAR_API_CONFIG.headers,
    body: JSON.stringify(request)
  })
  
  const result = await response.json()
  return result // Returns analysis job ID for tracking
}

// Example usage
const analysisJob = await triggerAIAnalysis({
  inspectionId: 'insp_123456',
  analysisTypes: ['damage_detection', 'cost_estimation', 'claims_intelligence'],
  options: {
    includeHiddenDamage: true,
    generateReport: true,
    priority: 'high'
  }
})

console.log('Analysis started:', analysisJob.jobId)
```

### Get Analysis Results

```typescript
interface AnalysisResults {
  inspectionId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number // 0-100
  results?: {
    damageAssessment: DamageAssessment[]
    costEstimate: CostBreakdown
    riskAssessment: RiskAnalysis
    claimsIntelligence: ClaimsIntelligence
    confidence: {
      overall: number
      damageDetection: number
      costAccuracy: number
    }
  }
  error?: string
  estimatedCompletionTime?: string
}

const getAnalysisResults = async (inspectionId: string) => {
  const response = await fetch(
    `${STELLAR_API_CONFIG.baseURL}/inspections/${inspectionId}/analysis`,
    { headers: STELLAR_API_CONFIG.headers }
  )
  
  return response.json() as Promise<AnalysisResults>
}

// Poll for completion
const waitForAnalysis = async (inspectionId: string, maxWaitTime = 300000) => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    const results = await getAnalysisResults(inspectionId)
    
    if (results.status === 'completed') {
      return results
    }
    
    if (results.status === 'failed') {
      throw new Error(`Analysis failed: ${results.error}`)
    }
    
    console.log(`Analysis progress: ${results.progress}%`)
    await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
  }
  
  throw new Error('Analysis timeout')
}
```

---

## 📊 Claims Intelligence API

### Get Carrier Profile

```typescript
interface CarrierProfile {
  carrierName: string
  claimsReputation: {
    averageSettlementRatio: number // 0-1
    timeToSettlement: number // days
    litigationRate: number // 0-1
    supplementalApprovalRate: number // 0-1
  }
  negotiationPatterns: {
    initialOfferRatio: number
    typicalCounterOffers: number
    successfulTactics: string[]
  }
  preferredContractors: string[]
  regionalVariations: Record<string, any>
  lastUpdated: string
}

const getCarrierProfile = async (carrierName: string) => {
  const response = await fetch(
    `${STELLAR_API_CONFIG.baseURL}/claims/carriers/${encodeURIComponent(carrierName)}`,
    { headers: STELLAR_API_CONFIG.headers }
  )
  
  return response.json() as Promise<CarrierProfile>
}

// Example usage
const profile = await getCarrierProfile('State Farm')
console.log(`Average settlement ratio: ${profile.claimsReputation.averageSettlementRatio * 100}%`)
```

### Get Market Data

```typescript
interface MarketData {
  region: string
  costPerSquareFoot: {
    residential: number
    commercial: number
  }
  laborRates: {
    skilled: number
    general: number
    specialized: number
  }
  materialCosts: Record<string, number>
  contractorAvailability: {
    available: number
    fullyBooked: number
    averageWaitTime: number // days
  }
  seasonalFactors: {
    peakSeason: string[]
    costMultiplier: number
  }
}

const getMarketData = async (zipCode: string) => {
  const response = await fetch(
    `${STELLAR_API_CONFIG.baseURL}/claims/market-data?zipCode=${zipCode}`,
    { headers: STELLAR_API_CONFIG.headers }
  )
  
  return response.json() as Promise<MarketData>
}
```

---

## 📄 Report Generation API

### Generate PDF Report

```typescript
interface ReportOptions {
  template: 'standard' | 'executive' | 'technical' | 'insurance'
  sections: string[] // Optional: specify which sections to include
  branding?: {
    logo: string // Base64 encoded logo
    companyName: string
    contactInfo: string
  }
  customization?: {
    primaryColor: string
    fontFamily: string
    includeWatermark: boolean
  }
}

const generatePDFReport = async (inspectionId: string, options?: ReportOptions) => {
  const response = await fetch(
    `${STELLAR_API_CONFIG.baseURL}/inspections/${inspectionId}/report/pdf`,
    {
      method: 'POST',
      headers: STELLAR_API_CONFIG.headers,
      body: JSON.stringify(options || { template: 'standard' })
    }
  )
  
  if (!response.ok) {
    throw new Error(`Report generation failed: ${response.statusText}`)
  }
  
  // Returns a job ID for tracking generation progress
  const result = await response.json()
  return result.jobId
}

// Check report generation status
const getReportStatus = async (jobId: string) => {
  const response = await fetch(
    `${STELLAR_API_CONFIG.baseURL}/reports/jobs/${jobId}`,
    { headers: STELLAR_API_CONFIG.headers }
  )
  
  return response.json()
}

// Download completed report
const downloadReport = async (jobId: string) => {
  const response = await fetch(
    `${STELLAR_API_CONFIG.baseURL}/reports/download/${jobId}`,
    { headers: STELLAR_API_CONFIG.headers }
  )
  
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`)
  }
  
  return response.blob() // Returns PDF blob
}

// Complete workflow
const generateAndDownloadReport = async (inspectionId: string) => {
  const jobId = await generatePDFReport(inspectionId)
  
  // Poll for completion
  while (true) {
    const status = await getReportStatus(jobId)
    
    if (status.status === 'completed') {
      return await downloadReport(jobId)
    }
    
    if (status.status === 'failed') {
      throw new Error(`Report generation failed: ${status.error}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}
```

---

## 🔄 Real-time WebSocket Integration

### WebSocket Connection

```typescript
class StellarWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  
  connect(token: string) {
    const wsUrl = `wss://api.stellar.ai/v1/ws?token=${token}`
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMessage(data)
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.attemptReconnect(token)
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }
  
  private handleMessage(data: any) {
    switch (data.type) {
      case 'inspection:analysis-progress':
        this.onAnalysisProgress(data.payload)
        break
      case 'inspection:analysis-complete':
        this.onAnalysisComplete(data.payload)
        break
      case 'file:upload-progress':
        this.onUploadProgress(data.payload)
        break
      default:
        console.log('Unknown message type:', data.type)
    }
  }
  
  private onAnalysisProgress(payload: any) {
    console.log(`Analysis progress for ${payload.inspectionId}: ${payload.progress}%`)
  }
  
  private onAnalysisComplete(payload: any) {
    console.log(`Analysis completed for ${payload.inspectionId}`)
    // Trigger UI update or data refresh
  }
  
  private onUploadProgress(payload: any) {
    console.log(`Upload progress for ${payload.fileId}: ${payload.progress}%`)
  }
  
  subscribe(inspectionId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        payload: { inspectionId }
      }))
    }
  }
  
  private attemptReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect(token)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Usage
const stellarWS = new StellarWebSocket()
stellarWS.connect(apiToken)
stellarWS.subscribe('insp_123456')
```

---

## 🔧 SDK and Libraries

### JavaScript/TypeScript SDK

```typescript
import { StellarClient } from '@stellar/sdk'

const stellar = new StellarClient({
  apiToken: process.env.STELLAR_API_TOKEN,
  baseURL: 'https://api.stellar.ai/v1',
  timeout: 30000
})

// High-level workflow
const processInspection = async (propertyData: PropertyData) => {
  try {
    // Create inspection
    const inspection = await stellar.inspections.create(propertyData)
    
    // Upload images
    const uploadResult = await stellar.inspections.uploadImages(
      inspection.id,
      imageFiles
    )
    
    // Start AI analysis
    const analysisJob = await stellar.ai.analyze({
      inspectionId: inspection.id,
      analysisTypes: ['damage_detection', 'cost_estimation'],
      options: { priority: 'high' }
    })
    
    // Wait for completion with real-time updates
    const results = await stellar.ai.waitForCompletion(
      analysisJob.jobId,
      {
        onProgress: (progress) => console.log(`Progress: ${progress}%`),
        timeout: 300000
      }
    )
    
    // Generate report
    const reportBlob = await stellar.reports.generatePDF(inspection.id, {
      template: 'executive'
    })
    
    return {
      inspection,
      analysis: results,
      report: reportBlob
    }
  } catch (error) {
    console.error('Inspection processing failed:', error)
    throw error
  }
}
```

### Python SDK

```python
from stellar_sdk import StellarClient
import asyncio

class StellarInspectionProcessor:
    def __init__(self, api_token: str):
        self.client = StellarClient(
            api_token=api_token,
            base_url="https://api.stellar.ai/v1"
        )
    
    async def process_inspection(self, property_data: dict, image_paths: list):
        try:
            # Create inspection
            inspection = await self.client.inspections.create(property_data)
            
            # Upload images
            upload_tasks = []
            for image_path in image_paths:
                task = self.client.inspections.upload_image(
                    inspection["id"], 
                    image_path
                )
                upload_tasks.append(task)
            
            await asyncio.gather(*upload_tasks)
            
            # Start AI analysis
            analysis_job = await self.client.ai.analyze({
                "inspection_id": inspection["id"],
                "analysis_types": ["damage_detection", "cost_estimation"],
                "options": {"priority": "high"}
            })
            
            # Wait for completion
            results = await self.client.ai.wait_for_completion(
                analysis_job["job_id"],
                timeout=300
            )
            
            return {
                "inspection": inspection,
                "analysis": results
            }
            
        except Exception as e:
            print(f"Processing failed: {e}")
            raise

# Usage
processor = StellarInspectionProcessor(os.getenv("STELLAR_API_TOKEN"))
result = await processor.process_inspection(property_data, image_files)
```

---

## 🚨 Error Handling & Best Practices

### Error Response Format

```typescript
interface APIError {
  error: {
    code: string
    message: string
    details?: any
    requestId: string
    timestamp: string
  }
}

// Common error codes
const ERROR_CODES = {
  AUTHENTICATION_FAILED: 'auth_failed',
  INVALID_REQUEST: 'invalid_request',
  RESOURCE_NOT_FOUND: 'not_found',
  RATE_LIMIT_EXCEEDED: 'rate_limit',
  ANALYSIS_FAILED: 'analysis_failed',
  INSUFFICIENT_CREDITS: 'insufficient_credits',
  VALIDATION_ERROR: 'validation_error'
}
```

### Retry Logic

```typescript
const apiRequest = async (url: string, options: RequestInit, maxRetries = 3) => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      
      if (response.ok) {
        return response.json()
      }
      
      if (response.status >= 400 && response.status < 500) {
        // Client error - don't retry
        throw new Error(`Client error: ${response.status} ${response.statusText}`)
      }
      
      // Server error - retry with exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
    } catch (error) {
      lastError = error as Error
      if (attempt === maxRetries) {
        throw lastError
      }
    }
  }
  
  throw lastError!
}
```

### Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests: number
  private readonly windowMs: number
  
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }
  
  async waitForPermission(): Promise<void> {
    const now = Date.now()
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0]
      const waitTime = this.windowMs - (now - oldestRequest)
      
      console.log(`Rate limit reached, waiting ${waitTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      
      return this.waitForPermission()
    }
    
    this.requests.push(now)
  }
}

// Usage
const rateLimiter = new RateLimiter(100, 60000) // 100 requests per minute

const makeAPICall = async (url: string, options: RequestInit) => {
  await rateLimiter.waitForPermission()
  return fetch(url, options)
}
```

---

This integration guide provides comprehensive examples for integrating with the Stellar Intelligence Platform. For additional support and advanced integration patterns, contact our technical support team.

**Next Steps:**
1. Sign up for API credentials at https://dashboard.stellar.ai
2. Review the complete API reference documentation
3. Test integration using our sandbox environment
4. Contact support for production deployment assistance