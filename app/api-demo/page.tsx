'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Copy, CheckCircle, Terminal, Database, Webhook, Shield, Cloud, Zap, ArrowRight, Settings, Key } from 'lucide-react'
import Link from 'next/link'

export default function ApiDemoPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [activeEndpoint, setActiveEndpoint] = useState('submit-claim')

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const endpoints = {
    'submit-claim': {
      method: 'POST',
      path: '/api/v1/claims/submit',
      description: 'Submit a new claim with images for AI analysis',
      request: `{
  "claimId": "CL-2024-94782",
  "type": "property",
  "images": [
    {
      "url": "https://storage.stellar.ai/img1.jpg",
      "timestamp": "2024-03-15T10:30:00Z"
    }
  ],
  "metadata": {
    "location": "123 Main St, Dallas, TX",
    "policyNumber": "HO-2024-78432"
  }
}`,
      response: `{
  "status": "processing",
  "claimId": "CL-2024-94782",
  "estimatedTime": 30,
  "damages": [
    {
      "type": "roof_damage",
      "severity": "moderate",
      "confidence": 0.92,
      "bbox": [120, 80, 450, 320]
    }
  ],
  "preliminaryEstimate": 15170,
  "webhookUrl": "https://your-domain.com/webhook/status"
}`
    },
    'get-estimate': {
      method: 'GET',
      path: '/api/v1/claims/{claimId}/estimate',
      description: 'Retrieve detailed cost estimation for a processed claim',
      request: `// GET /api/v1/claims/CL-2024-94782/estimate
// Headers: 
{
  "Authorization": "Bearer YOUR_API_KEY",
  "Accept": "application/json"
}`,
      response: `{
  "claimId": "CL-2024-94782",
  "totalEstimate": 15170,
  "breakdown": [
    {
      "item": "Roof Repair",
      "itemCode": "RFG 240",
      "quantity": 25,
      "unit": "SQ",
      "unitPrice": 285,
      "total": 7125
    },
    {
      "item": "Gutter Replacement",
      "itemCode": "GTR 110",
      "quantity": 120,
      "unit": "LF",
      "unitPrice": 12,
      "total": 1440
    }
  ],
  "taxRate": 0.07,
  "overheadProfit": 0.20
}`
    },
    'webhook-events': {
      method: 'WEBHOOK',
      path: 'Your configured endpoint',
      description: 'Real-time notifications for claim processing events',
      request: `// Webhook configuration
{
  "url": "https://your-domain.com/webhooks/stellar",
  "events": [
    "claim.submitted",
    "claim.processed",
    "damage.detected",
    "estimate.ready",
    "claim.approved"
  ],
  "secret": "whsec_your_webhook_secret"
}`,
      response: `{
  "event": "damage.detected",
  "timestamp": "2024-03-15T10:31:45Z",
  "data": {
    "claimId": "CL-2024-94782",
    "damagesDetected": 4,
    "confidenceAverage": 0.885,
    "severityDistribution": {
      "major": 1,
      "moderate": 2,
      "minor": 1
    },
    "requiresReview": false
  }
}`
    }
  }

  const currentEndpoint = endpoints[activeEndpoint as keyof typeof endpoints]

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-stellar-dark">Stellar</span>
              <span className="text-xl text-gray-600">API Documentation</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/demo"
                className="text-gray-700 hover:text-stellar-orange transition"
              >
                Interactive Demo
              </Link>
              <Link 
                href="/docs"
                className="bg-stellar-orange text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Full API Docs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-stellar-dark mb-4">
              Powerful API for Seamless Integration
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Integrate Stellar's AI-powered claims processing directly into your existing systems 
              with our comprehensive REST API and real-time webhooks
            </p>
          </div>

          {/* API Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Zap, label: 'Real-time Processing', value: '<100ms latency' },
              { icon: Shield, label: 'Enterprise Security', value: 'SOC 2 Compliant' },
              { icon: Cloud, label: 'Global Availability', value: '99.99% uptime' },
              { icon: Database, label: 'Batch Processing', value: 'Up to 1000 claims' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6 text-center"
              >
                <feature.icon className="mx-auto mb-3 text-stellar-orange" size={32} />
                <p className="font-semibold text-gray-800 mb-1">{feature.label}</p>
                <p className="text-sm text-gray-600">{feature.value}</p>
              </motion.div>
            ))}
          </div>

          {/* API Explorer */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Endpoint Tabs */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex gap-2 overflow-x-auto">
                {Object.entries(endpoints).map(([key, endpoint]) => (
                  <button
                    key={key}
                    onClick={() => setActiveEndpoint(key)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                      activeEndpoint === key
                        ? 'bg-stellar-orange text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`inline-block px-2 py-1 text-xs rounded mr-2 ${
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {endpoint.method}
                    </span>
                    {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint Details */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-stellar-dark mb-2">
                  {currentEndpoint.description}
                </h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <Terminal size={20} />
                  <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                    {currentEndpoint.path}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Request */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">Request</h3>
                    <button
                      onClick={() => copyToClipboard(currentEndpoint.request, 'request')}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-stellar-orange transition"
                    >
                      {copiedSection === 'request' ? (
                        <>
                          <CheckCircle size={16} className="text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{currentEndpoint.request}</pre>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">Response</h3>
                    <button
                      onClick={() => copyToClipboard(currentEndpoint.response, 'response')}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-stellar-orange transition"
                    >
                      {copiedSection === 'response' ? (
                        <>
                          <CheckCircle size={16} className="text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{currentEndpoint.response}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Options */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <Webhook className="text-stellar-orange mb-4" size={32} />
              <h3 className="text-xl font-bold text-stellar-dark mb-2">Webhooks</h3>
              <p className="text-gray-600 mb-4">
                Receive real-time notifications for claim events, damage detection, and estimate updates
              </p>
              <Link href="/docs/webhooks" className="text-stellar-orange font-semibold flex items-center gap-1">
                Learn more <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <Settings className="text-stellar-orange mb-4" size={32} />
              <h3 className="text-xl font-bold text-stellar-dark mb-2">SDKs & Libraries</h3>
              <p className="text-gray-600 mb-4">
                Official SDKs available for Python, Node.js, Java, .NET, and more languages
              </p>
              <Link href="/docs/sdks" className="text-stellar-orange font-semibold flex items-center gap-1">
                View SDKs <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <Key className="text-stellar-orange mb-4" size={32} />
              <h3 className="text-xl font-bold text-stellar-dark mb-2">Authentication</h3>
              <p className="text-gray-600 mb-4">
                Secure API access with OAuth 2.0, API keys, and webhook signatures
              </p>
              <Link href="/docs/auth" className="text-stellar-orange font-semibold flex items-center gap-1">
                Get API Key <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Code Examples */}
          <div className="mt-12 bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-stellar-dark mb-6">Quick Start Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Python</h3>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm">
                  <pre>{`import stellar

client = stellar.Client(api_key="sk_live_...")

# Submit a claim
claim = client.claims.submit(
    images=["path/to/image.jpg"],
    metadata={"policy": "HO-2024-78432"}
)

print(f"Estimate: ${'${claim.estimate}'}")`}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Node.js</h3>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm">
                  <pre>{`const stellar = require('@stellar/node');

const client = new stellar.Client({
  apiKey: 'sk_live_...'
});

// Submit a claim
const claim = await client.claims.submit({
  images: ['path/to/image.jpg'],
  metadata: { policy: 'HO-2024-78432' }
});

console.log(\`Estimate: $\${claim.estimate}\`);`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-stellar-orange rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Integrate?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Get your API key and start processing claims in minutes
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-stellar-orange px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Get API Key
              </Link>
              <Link
                href="/docs"
                className="bg-transparent text-white px-8 py-3 rounded-lg font-semibold border-2 border-white hover:bg-white/10 transition"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}