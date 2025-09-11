import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Environment variables
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/chat-assistant'
const N8N_API_KEY = process.env.N8N_API_KEY
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

// Request validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.object({
    source: z.string().optional(),
    platform: z.string().optional(),
    language: z.string().optional(),
  }).optional(),
})

// Response type
interface ChatResponse {
  response: string
  sessionId: string
  metadata?: {
    confidence?: number
    intent?: string
    qualified?: boolean
    suggestedActions?: string[]
    tokens?: number
  }
}

// Session ID generator
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 30 // requests per minute
const RATE_WINDOW = 60000 // 1 minute in milliseconds

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false
  }

  userLimit.count++
  return true
}

// Error response helper
function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message, timestamp: new Date().toISOString() },
    { status }
  )
}

// Main POST handler for chat messages
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      return errorResponse('Rate limit exceeded. Please try again later.', 429)
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = chatRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return errorResponse(
        `Invalid request: ${validationResult.error.issues[0].message}`,
        400
      )
    }

    const { message, sessionId, userId, metadata } = validationResult.data

    // Generate or use existing session ID
    const currentSessionId = sessionId || generateSessionId()

    // Prepare payload for n8n webhook
    const n8nPayload = {
      message,
      sessionId: currentSessionId,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      metadata: {
        source: metadata?.source || 'web_chat',
        platform: metadata?.platform || 'innovoco_website',
        language: metadata?.language || 'en',
        ip: clientIp,
      }
    }

    // Prepare headers for n8n request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add authentication if configured
    if (N8N_API_KEY) {
      headers['Authorization'] = `Bearer ${N8N_API_KEY}`
    }

    if (WEBHOOK_SECRET) {
      headers['X-Webhook-Secret'] = WEBHOOK_SECRET
    }

    // Call n8n webhook with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(n8nPayload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!n8nResponse.ok) {
        console.error(`n8n webhook error: ${n8nResponse.status} ${n8nResponse.statusText}`)
        
        // Fallback response when n8n is unavailable
        return NextResponse.json<ChatResponse>({
          response: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or contact our support team directly at support@innovoco.com.",
          sessionId: currentSessionId,
          metadata: {
            confidence: 0,
            intent: 'error',
          }
        })
      }

      const n8nData = await n8nResponse.json()

      // Format and return response
      const response: ChatResponse = {
        response: n8nData.response || n8nData.message || "I'm here to help! How can I assist you today?",
        sessionId: n8nData.sessionId || currentSessionId,
        metadata: {
          confidence: n8nData.confidence,
          intent: n8nData.intent,
          qualified: n8nData.qualified,
          suggestedActions: n8nData.suggestedActions,
          tokens: n8nData.tokens,
        }
      }

      // Set session cookie for continuity
      const responseHeaders = new Headers()
      responseHeaders.set(
        'Set-Cookie',
        `chat_session=${currentSessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
      )

      return NextResponse.json(response, { headers: responseHeaders })

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('n8n webhook timeout')
        return errorResponse('Request timeout. Please try again.', 504)
      }
      throw error
    }

  } catch (error) {
    console.error('Chat API Error:', error)
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error logging to monitoring service
      // logError(error, { endpoint: 'chat/n8n', method: 'POST' })
    }

    return errorResponse(
      'An unexpected error occurred. Please try again later.',
      500
    )
  }
}

// GET handler for health check
export async function GET(request: NextRequest) {
  try {
    // Check n8n webhook availability
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    let n8nStatus = 'unknown'
    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/health`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      n8nStatus = response.ok ? 'healthy' : 'unhealthy'
    } catch (error) {
      clearTimeout(timeoutId)
      n8nStatus = 'unreachable'
    }

    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        n8n: n8nStatus,
      },
      version: '1.0.0',
    })
  } catch (error) {
    console.error('Health check error:', error)
    return errorResponse('Health check failed', 500)
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}