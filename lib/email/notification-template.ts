/**
 * Email Notification Template Builder
 * 
 * Generates consistent, professional HTML emails based on structured schema
 */

import { EmailNotificationSchema } from './notification-schema';

/**
 * Build complete HTML email from schema
 */
export function buildNotificationEmail(data: EmailNotificationSchema): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.emailConfig.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    
    .container {
      max-width: 680px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    /* Header Styles */
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      position: relative;
    }
    
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .priority-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255,255,255,0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      backdrop-filter: blur(10px);
    }
    
    .priority-HIGH { background: #ff4444; }
    .priority-MEDIUM { background: #ffaa00; }
    .priority-LOW { background: #00C851; }
    
    /* Score Section */
    .score-section {
      background: linear-gradient(to right, #f8f9fa, #e9ecef);
      padding: 25px;
      text-align: center;
      border-bottom: 3px solid ${data.header.tierColor};
    }
    
    .score-display {
      font-size: 48px;
      font-weight: bold;
      color: ${data.header.tierColor};
      margin: 10px 0;
    }
    
    .intent-type {
      font-size: 16px;
      color: #666;
      text-transform: capitalize;
      margin-top: 5px;
      font-weight: 500;
    }
    
    .opportunity-summary {
      background: white;
      border-left: 4px solid ${data.header.tierColor};
      padding: 15px;
      margin: 20px auto;
      max-width: 500px;
      text-align: left;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .opportunity-summary h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .opportunity-summary p {
      margin: 0;
      color: #555;
      line-height: 1.5;
    }
    
    .tier-badge {
      display: inline-block;
      background: ${data.header.tierColor};
      color: white;
      padding: 6px 20px;
      border-radius: 20px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 14px;
      margin-top: 10px;
    }
    
    /* Content Sections */
    .content {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e9ecef;
    }
    
    /* Info Grid */
    .info-grid {
      display: table;
      width: 100%;
      border-collapse: collapse;
    }
    
    .info-row {
      display: table-row;
    }
    
    .info-label {
      display: table-cell;
      padding: 10px;
      background: #f8f9fa;
      font-weight: 600;
      width: 35%;
      border-bottom: 1px solid #dee2e6;
    }
    
    .info-value {
      display: table-cell;
      padding: 10px;
      border-bottom: 1px solid #dee2e6;
    }
    
    /* Qualification Checklist */
    .checklist {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .checklist li {
      padding: 12px;
      margin-bottom: 8px;
      background: #f8f9fa;
      border-left: 4px solid #dee2e6;
      border-radius: 4px;
    }
    
    .checklist li.met {
      background: #e7f5ef;
      border-left-color: #00C851;
    }
    
    .checklist li.not-met {
      background: #fef5e7;
      border-left-color: #ffaa00;
    }
    
    .checklist li.critical {
      background: #fee7e7;
      border-left-color: #ff4444;
    }
    
    /* Conversation Highlights */
    .conversation-box {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 15px 0;
    }
    
    .message {
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 6px;
    }
    
    .message-visitor {
      background: white;
      border-left: 3px solid #667eea;
      margin-right: 20px;
    }
    
    .message-ai {
      background: #e7f5ef;
      border-left: 3px solid #00C851;
      margin-left: 20px;
    }
    
    .message-speaker {
      font-weight: bold;
      color: #667eea;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    
    /* Action Box */
    .action-box {
      background: linear-gradient(135deg, #fff3cd, #ffe8a1);
      border: 2px solid #ffaa00;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    
    .action-box.urgent {
      background: linear-gradient(135deg, #fee7e7, #ffcccc);
      border-color: #ff4444;
    }
    
    .action-title {
      font-size: 20px;
      font-weight: bold;
      color: #d73502;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    
    .action-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .action-list li {
      padding: 10px 0;
      padding-left: 30px;
      position: relative;
    }
    
    .action-list li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #ff6b35;
      font-weight: bold;
      font-size: 18px;
    }
    
    /* BANT Score Table */
    .bant-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    
    .bant-table th {
      background: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    
    .bant-table td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
      background: white;
    }
    
    .bant-table tr:nth-child(even) td {
      background: #f8f9fa;
    }
    
    .score-bar {
      height: 20px;
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }
    
    .score-fill {
      height: 100%;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    
    /* Color-coded progress bars based on performance */
    .score-fill-high {
      background: linear-gradient(to right, #00C851, #00a040);
      color: white;
    }
    
    .score-fill-medium {
      background: linear-gradient(to right, #ffaa00, #ff8800);
      color: white;
    }
    
    .score-fill-low {
      background: linear-gradient(to right, #ff4444, #cc0000);
      color: white;
    }
    
    /* Footer */
    .footer {
      background: #2c3e50;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
    
    .footer a {
      color: #3498db;
      text-decoration: none;
    }
    
    /* Responsive */
    @media (max-width: 600px) {
      .info-label, .info-value {
        display: block;
        width: 100%;
      }
      
      .message-ai {
        margin-left: 0;
      }
      
      .message-visitor {
        margin-right: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="priority-badge priority-${data.header.priority}">
        ${data.header.priorityEmoji} ${data.header.priority} PRIORITY
      </div>
      <h1>🎯 New Qualified Lead from AI Chat</h1>
    </div>
    
    <!-- Score Section -->
    <div class="score-section">
      <div>📊 Lead Score</div>
      <div class="score-display">${data.header.score}/${data.header.maxScore}</div>
      <div class="intent-type">
        Intent: <strong>${data.header.intentType.replace('_', ' ').toUpperCase()}</strong>
      </div>
      <div class="tier-badge">${data.header.tier.toUpperCase()} LEAD</div>
      
      ${data.header.opportunitySummary ? `
      <div class="opportunity-summary">
        <h4>Executive Summary</h4>
        <p>${data.header.opportunitySummary}</p>
      </div>
      ` : ''}
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Contact Information -->
      <div class="section">
        <h2 class="section-title">👤 Contact Information</h2>
        <div class="info-grid">
          <div class="info-row">
            <div class="info-label">Name:</div>
            <div class="info-value">${data.leadDetails.contactInfo.name}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">
              <a href="mailto:${data.leadDetails.contactInfo.email}">${data.leadDetails.contactInfo.email}</a>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">Phone:</div>
            <div class="info-value">${data.leadDetails.contactInfo.phone}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Role:</div>
            <div class="info-value">
              ${data.leadDetails.contactInfo.role} ${data.leadDetails.contactInfo.decisionMakerLabel}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Company Details -->
      <div class="section">
        <h2 class="section-title">🏢 Company Details</h2>
        <div class="info-grid">
          <div class="info-row">
            <div class="info-label">Company:</div>
            <div class="info-value">${data.leadDetails.companyInfo.name}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Industry:</div>
            <div class="info-value">${data.leadDetails.companyInfo.industry}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Size:</div>
            <div class="info-value">${data.leadDetails.companyInfo.sizeLabel}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Budget:</div>
            <div class="info-value"><strong>${data.leadDetails.requirements.budget}</strong></div>
          </div>
          <div class="info-row">
            <div class="info-label">Timeline:</div>
            <div class="info-value">${data.leadDetails.requirements.timeline}</div>
          </div>
        </div>
      </div>
      
      <!-- BANT Qualification -->
      <div class="section">
        <h2 class="section-title">📊 BANT Qualification Breakdown</h2>
        <table class="bant-table">
          <thead>
            <tr>
              <th>Factor</th>
              <th>Score</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Budget</strong></td>
              <td>${data.qualificationFactors.bantScore.budget.score}/${data.qualificationFactors.bantScore.budget.max}</td>
              <td>${data.qualificationFactors.bantScore.budget.status}</td>
              <td>
                <div class="score-bar">
                  <div class="score-fill ${(data.qualificationFactors.bantScore.budget.score / data.qualificationFactors.bantScore.budget.max) * 100 >= 80 ? 'score-fill-high' : (data.qualificationFactors.bantScore.budget.score / data.qualificationFactors.bantScore.budget.max) * 100 >= 50 ? 'score-fill-medium' : 'score-fill-low'}" style="width: ${(data.qualificationFactors.bantScore.budget.score / data.qualificationFactors.bantScore.budget.max) * 100}%;">
                    ${Math.round((data.qualificationFactors.bantScore.budget.score / data.qualificationFactors.bantScore.budget.max) * 100)}%
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>Authority</strong></td>
              <td>${data.qualificationFactors.bantScore.authority.score}/${data.qualificationFactors.bantScore.authority.max}</td>
              <td>${data.qualificationFactors.bantScore.authority.status}</td>
              <td>
                <div class="score-bar">
                  <div class="score-fill ${(data.qualificationFactors.bantScore.authority.score / data.qualificationFactors.bantScore.authority.max) * 100 >= 80 ? 'score-fill-high' : (data.qualificationFactors.bantScore.authority.score / data.qualificationFactors.bantScore.authority.max) * 100 >= 50 ? 'score-fill-medium' : 'score-fill-low'}" style="width: ${(data.qualificationFactors.bantScore.authority.score / data.qualificationFactors.bantScore.authority.max) * 100}%;">
                    ${Math.round((data.qualificationFactors.bantScore.authority.score / data.qualificationFactors.bantScore.authority.max) * 100)}%
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>Need</strong></td>
              <td>${data.qualificationFactors.bantScore.need.score}/${data.qualificationFactors.bantScore.need.max}</td>
              <td>${data.qualificationFactors.bantScore.need.status}</td>
              <td>
                <div class="score-bar">
                  <div class="score-fill ${(data.qualificationFactors.bantScore.need.score / data.qualificationFactors.bantScore.need.max) * 100 >= 80 ? 'score-fill-high' : (data.qualificationFactors.bantScore.need.score / data.qualificationFactors.bantScore.need.max) * 100 >= 50 ? 'score-fill-medium' : 'score-fill-low'}" style="width: ${(data.qualificationFactors.bantScore.need.score / data.qualificationFactors.bantScore.need.max) * 100}%;">
                    ${Math.round((data.qualificationFactors.bantScore.need.score / data.qualificationFactors.bantScore.need.max) * 100)}%
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>Timeline</strong></td>
              <td>${data.qualificationFactors.bantScore.timeline.score}/${data.qualificationFactors.bantScore.timeline.max}</td>
              <td>${data.qualificationFactors.bantScore.timeline.status}</td>
              <td>
                <div class="score-bar">
                  <div class="score-fill ${(data.qualificationFactors.bantScore.timeline.score / data.qualificationFactors.bantScore.timeline.max) * 100 >= 80 ? 'score-fill-high' : (data.qualificationFactors.bantScore.timeline.score / data.qualificationFactors.bantScore.timeline.max) * 100 >= 50 ? 'score-fill-medium' : 'score-fill-low'}" style="width: ${(data.qualificationFactors.bantScore.timeline.score / data.qualificationFactors.bantScore.timeline.max) * 100}%;">
                    ${Math.round((data.qualificationFactors.bantScore.timeline.score / data.qualificationFactors.bantScore.timeline.max) * 100)}%
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Qualification Factors -->
      <div class="section">
        <h2 class="section-title">✅ Qualification Factors</h2>
        <ul class="checklist">
          ${data.qualificationFactors.checklistItems.map(item => `
            <li class="${item.met ? 'met' : item.importance === 'critical' ? 'critical' : 'not-met'}">
              ${item.emoji} ${item.label}: <strong>${item.detail}</strong>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <!-- Conversation Highlights -->
      <div class="section">
        <h2 class="section-title">💬 Conversation Highlights</h2>
        <div class="conversation-box">
          ${data.conversationHighlights.keyExchanges.slice(0, 5).map(exchange => `
            <div class="message message-${exchange.speaker}">
              <div class="message-speaker">${exchange.speaker}:</div>
              <div>${exchange.message}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Action Required -->
      <div class="action-box ${data.actionItems.urgency === 'IMMEDIATE' || data.actionItems.urgency === '2_HOURS' ? 'urgent' : ''}">
        <div class="action-title">
          ⚡ ACTION REQUIRED - ${data.actionItems.urgencyMessage}
        </div>
        <p><strong>This is a qualified lead. Please follow up within ${data.actionItems.urgency.replace('_', ' ').toLowerCase()}!</strong></p>
        
        <h3>Recommended Actions:</h3>
        <ul class="action-list">
          ${data.actionItems.recommendedActions.map(action => `
            <li>${action.action}</li>
          `).join('')}
        </ul>
        
        <p style="margin-top: 20px;">
          <strong>Primary Focus:</strong> ${data.actionItems.primaryFocus}<br>
          <strong>Suggested Approach:</strong> ${data.actionItems.suggestedApproach}
        </p>
      </div>
      
      <!-- Session Metadata -->
      <div class="section" style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <h3 style="margin-top: 0;">📋 Session Details</h3>
        <div style="font-size: 14px; color: #666;">
          <strong>Session ID:</strong> ${data.metadata.sessionId}<br>
          <strong>Timestamp:</strong> ${data.metadata.timestampFormatted}<br>
          <strong>Source:</strong> ${data.metadata.sourceDetails}<br>
          <strong>Duration:</strong> ${data.conversationHighlights.engagement.conversationDuration}<br>
          <strong>Messages:</strong> ${data.conversationHighlights.engagement.messageCount}<br>
          <strong>Engagement Level:</strong> ${data.conversationHighlights.engagement.engagementLevel}
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>This lead was automatically qualified and routed by Innovoco AI Lead Intelligence System</p>
      <p>
        <a href="https://innovoco.com/dashboard">View in Dashboard</a> | 
        <a href="https://innovoco.com/crm">Add to CRM</a> | 
        <a href="mailto:support@innovoco.com">Report Issue</a>
      </p>
      <p style="margin-top: 15px; opacity: 0.8;">
        © 2025 Innovoco AI & Automation. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}