/**
 * LangGraph Studio API Export - UI Interaction Subgraph
 * This file exposes the UI interaction subgraph for form collection workflows
 */

import { buildUIInteractionGraph } from '../ui-interaction-graph';

// Create and export the UI interaction subgraph  
export const graph = buildUIInteractionGraph();

// Export metadata for visualization
export const metadata = {
  title: "UI Interaction Subgraph",
  description: "State machine for collecting user information through UI forms",
  version: "2.0.0",
  pattern: "Ask → Push UI → Wait → Confirm → Store",
  states: [
    {
      name: "idle", 
      description: "Initial state, ready for interaction"
    },
    {
      name: "asking_email",
      description: "Agent verbally requests email address"
    },
    {
      name: "waiting_email", 
      description: "UI form pushed, waiting for user input"
    },
    {
      name: "confirming_email",
      description: "Confirming received email with user"
    },
    {
      name: "asking_phone",
      description: "Agent verbally requests phone number"
    },
    {
      name: "waiting_phone",
      description: "UI form pushed, waiting for phone input"  
    },
    {
      name: "confirming_phone",
      description: "Confirming received phone with user"
    },
    {
      name: "asking_company",
      description: "Agent verbally requests company information"
    },
    {
      name: "waiting_company",
      description: "UI form pushed, waiting for company input"
    },
    {
      name: "confirming_company", 
      description: "Confirming received company info with user"
    },
    {
      name: "collecting_requirements",
      description: "Gathering detailed requirements through conversation"
    },
    {
      name: "completed",
      description: "All required information collected successfully"
    }
  ],
  flow_control: {
    triggers: [
      "ui_interaction_needed → start collection",
      "form_submitted → confirm and store data", 
      "confirmation_complete → next field or complete",
      "user_declines → graceful handling"
    ],
    validation: "Real-time validation on form submission",
    persistence: "Data stored in conversation state",
    fallback: "Graceful degradation to conversational collection"
  },
  tools_used: [
    "push_ui_form - Display collection forms to user",
    "store_user_info - Persist collected information",
    "validate_email - Email format validation",
    "validate_phone - Phone number format validation"
  ],
  integration_points: [
    "Called from main orchestrator when contact info needed",
    "Returns to main flow once collection complete",
    "State persisted across conversation turns"
  ]
};