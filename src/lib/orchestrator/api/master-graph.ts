/**
 * LangGraph Studio API Export - Master Orchestrator
 * This file exposes the master orchestrator graph for LangGraph Studio
 */

import { createMasterOrchestrator } from '../master';

// Export a promise that resolves to the compiled graph for LangGraph Studio
export const graph = createMasterOrchestrator();

// Export metadata for better visualization
export const metadata = {
  title: "Master AI Agent Orchestrator",
  description: "Routes customer inquiries to specialized AI agents with state management and parallel processing",
  version: "2.0.0",
  nodes: [
    "router", 
    "sales_agent", 
    "technical_agent", 
    "support_agent", 
    "analytics_agent",
    "recommendation_agent",
    "qualification_agent",
    "ui_interaction_agent"
  ],
  edges: [
    "router → sales_agent",
    "router → technical_agent", 
    "router → support_agent",
    "router → qualification_agent",
    "router → ui_interaction_agent",
    "analytics_agent ↔ recommendation_agent (parallel)"
  ],
  features: [
    "Smart routing with confidence scoring",
    "Parallel processing for analytics and recommendations", 
    "Session persistence with TTL",
    "UI interaction state management",
    "BANT qualification scoring",
    "Comprehensive conversation history"
  ]
};