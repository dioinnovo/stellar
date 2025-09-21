# Stella AI Agents Library

## Overview

Stella is the unified AI assistant for Stellar Adjusting, appearing as a single consistent brand while operating in specialized modes based on context and user needs. This document details the two distinct Stella agent configurations and their specific purposes.

## Agent Architecture

Both agents share the name "Stella" for brand consistency but operate with different:
- System prompts
- API endpoints
- Model configurations
- Functional focuses
- User audiences

## Agent Configurations

### 1. Stella (Lead Generation Mode) - `stella-leads`

**Purpose**: Convert website visitors into qualified leads for Stellar Adjusting

**Component Name**: `stella-leads`
**File Location**: `/lib/ai/prompts/stella-leads-prompt.ts`
**API Endpoint**: `/api/stella-leads/chat`
**UI Component**: `VirtualAssistant` (`/components/virtual-assistant.tsx`)
**Deployment Location**: Landing pages, demo pages, public website

**Target Audience**:
- Property owners with insurance claims
- Website visitors seeking help with insurance disputes
- Prospects frustrated with insurance company treatment

**Core Functions**:
- Lead qualification and assessment
- Pain point identification
- Urgency creation
- Trust building
- Conversion to scheduled consultations

**Model Configuration**:
```javascript
{
  model: "gpt-4o-mini",      // Fast, efficient
  temperature: 0.7,           // Conversational tone
  max_tokens: 1500,           // Concise responses
  focus: "conversion"         // Lead generation metrics
}
```

**Key Capabilities**:
- Identifies prospects with claims worth $10K+
- Qualifies leads based on multiple dimensions
- Creates urgency around claim deadlines
- Overcomes common objections
- Schedules free claim reviews

**Success Metrics**:
- Lead qualification rate
- Conversion to consultation
- Lead quality score
- Time to qualification

**Quick Actions Available**:
- `QUALIFY_LEAD` - Assess claim potential
- `IDENTIFY_PAIN` - Uncover insurance company tactics
- `CREATE_URGENCY` - Highlight time-sensitive factors
- `OVERCOME_OBJECTION` - Address concerns
- `SCHEDULE_REVIEW` - Convert to appointment

---

### 2. Stella (Claims Analysis Mode) - `stella-claims`

**Purpose**: Comprehensive policy analysis and opportunity discovery for internal public adjusters

**Component Name**: `stella-claims`
**File Location**: `/lib/ai/prompts/stella-claims-prompt.ts`
**API Endpoint**: `/api/stella-claims/chat`
**UI Component**: `MobileChatInterface` (`/components/mobile-chat-interface.tsx`)
**Deployment Location**: Dashboard (`/dashboard/assistant`)

**Target Audience**:
- Internal public adjusters
- Claims processing team
- Policy analysts
- Company employees

**Core Functions**:
- Comprehensive 13-point policy review
- Coverage opportunity discovery
- Settlement maximization strategies
- Compliance verification
- Documentation requirements

**Model Configuration**:
```javascript
{
  model: "gpt-4o",            // Most capable model
  temperature: 0.5,           // Precise analysis
  max_tokens: 3000,           // Comprehensive reports
  focus: "analysis"           // Deep policy review
}
```

**Key Capabilities**:

#### 13-Point Policy Review Checklist:
1. **Policy Effective Dates** - Coverage period, gaps, retroactive dates
2. **Policyholder Identification** - Named insureds, additional insureds
3. **Insured Location Coverage** - Primary, additional, territory limits
4. **Policy Limits Analysis** - Per occurrence, aggregate, sublimits
5. **Deductible Structure** - Standard, hurricane, percentage vs. dollar
6. **Exclusions & Endorsements** - Standard exclusions, added endorsements
7. **Appraisal Language** - Provisions, timelines, PA participation
8. **Managed Repair Programs** - Requirements, opt-outs, limitations
9. **Premium Reductions Impact** - Coverage limitations from discounts
10. **Claim-Specific Language** - Water, wind, fire, theft provisions
11. **Mold Coverage** - Limits, remediation, prevention requirements
12. **Emergency Services** - EMS/dry-out limits, mitigation coverage
13. **Mortgage Information** - Mortgagee clauses, payment procedures

#### Additional Capabilities:
- **Hidden Coverage Discovery** - Ordinance/law, debris removal, code upgrades
- **ALE Maximization** - All recoverable living expenses
- **Business Interruption** - Lost income, extra expense (commercial)
- **State Compliance** - PA authorization, fee structures, disclosures
- **Bad Faith Analysis** - Indicators and statutory violations
- **Settlement Strategies** - Negotiation leverage, timing optimization

**Quick Actions Available**:
- `FULL_POLICY_REVIEW` - Complete 13-point analysis
- `COVERAGE_OPPORTUNITIES` - Find all cash settlements
- `EXCLUSION_ANALYSIS` - Review policy exclusions
- `DEDUCTIBLE_CALCULATION` - Calculate all deductibles
- `ALE_MAXIMIZATION` - Analyze living expenses
- `APPRAISAL_STRATEGY` - Appraisal recommendations
- `DOCUMENTATION_CHECKLIST` - Required documents
- `COMPLIANCE_CHECK` - State requirements
- `BAD_FAITH_ANALYSIS` - Identify violations
- `CODE_UPGRADE_REVIEW` - Building code benefits
- `SETTLEMENT_MAXIMIZATION` - Optimization strategies
- `MRP_ANALYSIS` - Managed repair review
- `ENDORSEMENT_IMPACT` - Endorsement analysis
- `STATE_SPECIFIC_REQUIREMENTS` - State regulations

**Success Metrics**:
- Coverage opportunities identified
- Settlement increase percentage
- Compliance verification rate
- Analysis comprehensiveness score

---

## Implementation Guide

### Using Stella Leads (Public-Facing)

```typescript
// Import the VirtualAssistant component
import VirtualAssistant from '@/components/virtual-assistant'

// Implement on landing page
export default function LandingPage() {
  return (
    <>
      {/* Your landing page content */}
      <VirtualAssistant />
    </>
  )
}
```

### Using Stella Claims (Internal Dashboard)

```typescript
// Import the MobileChatInterface component
import MobileChatInterface from '@/components/mobile-chat-interface'

// Implement in dashboard
export default function DashboardAssistant() {
  return (
    <MobileChatInterface />
  )
}
```

---

## API Integration

### Stella Leads API

**Endpoint**: `POST /api/stella-leads/chat`

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I have hurricane damage and my insurance offered $5000"
    }
  ],
  "quickAction": "QUALIFY_LEAD",
  "generateTitle": true
}
```

**Response**:
```json
{
  "response": "Stella's response...",
  "suggestions": ["Schedule free review", "Learn your rights"],
  "title": "Hurricane Claim",
  "leadQuality": {
    "qualified": true,
    "score": 75,
    "reasons": ["High-value claim", "Lowball offer"]
  }
}
```

### Stella Claims API

**Endpoint**: `POST /api/stella-claims/chat`

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Review this homeowners policy for opportunities"
    }
  ],
  "quickAction": "FULL_POLICY_REVIEW",
  "policyDocument": {
    "type": "homeowners",
    "carrier": "State Farm",
    "number": "POL-123456"
  }
}
```

**Response**:
```json
{
  "response": "Comprehensive policy analysis...",
  "suggestions": ["Review deductibles", "Check endorsements"],
  "title": "Policy Review",
  "context": {
    "hasPolicyData": true,
    "settlementOpportunities": 15
  }
}
```

---

## Best Practices

### For Lead Generation (stella-leads)
1. Keep responses conversational and empathetic
2. Focus on pain points and urgency
3. Always drive toward scheduling consultations
4. Qualify based on claim value ($10K minimum)
5. Build trust through success stories

### For Policy Analysis (stella-claims)
1. Be thorough and precise in analysis
2. Never miss a coverage opportunity
3. Document all findings comprehensively
4. Verify state-specific requirements
5. Provide actionable recommendations

---

## Configuration Management

### Environment Variables

```env
# Stella Leads Configuration
NEXT_PUBLIC_AI_API_ENDPOINT=/api/stella-leads/chat
NEXT_PUBLIC_AI_MODEL=gpt-4o-mini

# Stella Claims Configuration
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_DEPLOYMENT_ADVANCED=gpt-4o
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_ENDPOINT=your-endpoint-here
AZURE_OPENAI_VERSION=2024-12-01-preview
```

### Prompt Updates

To update prompts, modify the respective files:
- Lead Generation: `/lib/ai/prompts/stella-leads-prompt.ts`
- Policy Analysis: `/lib/ai/prompts/stella-claims-prompt.ts`

---

## Monitoring & Optimization

### Key Performance Indicators

**Stella Leads**:
- Conversation-to-lead conversion rate
- Average time to qualification
- Lead quality score distribution
- Drop-off points in conversation

**Stella Claims**:
- Opportunities identified per policy
- Analysis completeness score
- Time to complete review
- Accuracy of recommendations

### A/B Testing Recommendations

1. **Prompt Variations**: Test different opening messages
2. **Quick Actions**: Measure effectiveness of different quick actions
3. **Temperature Settings**: Optimize for engagement vs. precision
4. **Response Length**: Balance thoroughness with readability

---

## Future Enhancements

### Planned Features
1. **Document Upload**: Direct policy PDF analysis
2. **Multi-state Compliance**: Automated state-specific adjustments
3. **Integration with CRM**: Direct lead pipeline management
4. **Voice Integration**: Speech-to-text for both modes
5. **Real-time Collaboration**: Multiple adjusters on same analysis
6. **Historical Analysis**: Learn from past successful claims

### Potential New Agents
1. **Stella Training**: Internal training and onboarding
2. **Stella Compliance**: Regulatory monitoring and alerts
3. **Stella Negotiation**: Real-time negotiation assistance
4. **Stella Documentation**: Automated report generation

---

## Support & Maintenance

### Troubleshooting

**Common Issues**:
1. **API Timeout**: Increase max_tokens or optimize prompts
2. **Low Lead Quality**: Adjust qualification parameters
3. **Incomplete Analysis**: Verify policy document parsing
4. **State Compliance**: Update state-specific rules

### Contact

For questions or support regarding Stella agents:
- Technical Issues: dev-team@stellaradjusting.com
- Prompt Optimization: ai-team@stellaradjusting.com
- Business Logic: product@stellaradjusting.com

---

## Version History

### v2.0.0 (Current)
- Separated Stella into two specialized agents
- Added comprehensive 13-point policy review
- Enhanced lead qualification scoring
- Implemented state-specific compliance

### v1.0.0
- Initial Stella implementation
- Basic lead generation capabilities
- Simple policy review features

---

*Last Updated: December 2024*
*Document Version: 2.0.0*