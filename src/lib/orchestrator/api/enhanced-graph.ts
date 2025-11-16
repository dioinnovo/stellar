/**
 * LangGraph Studio API Export - Enhanced Master Orchestrator
 * This file exposes the enhanced master orchestrator with all advanced features
 */

import { enhancedOrchestrator } from '../enhanced-master';

// Export the compiled graph for LangGraph Studio
export const graph = enhancedOrchestrator.graph;

// Export metadata for LangGraph Studio visualization
export const metadata = {
  title: "Enhanced AI Agent Orchestrator",
  description: "Advanced multi-agent system with state persistence, parallel processing, and UI interaction flows",
  version: "3.0.0",
  architecture: {
    type: "StateGraph",
    persistence: "MemorySaver with TTL",
    recursion_limit: 50,
    streaming: true
  },
  agents: [
    {
      name: "Router Agent",
      purpose: "Intelligent routing with confidence scoring",
      model: "GPT-4o"
    },
    {
      name: "Sales Agent", 
      purpose: "Product demos, pricing, lead qualification",
      model: "GPT-4o"
    },
    {
      name: "Technical Agent",
      purpose: "Implementation, integration, technical support", 
      model: "GPT-5"
    },
    {
      name: "Support Agent",
      purpose: "Customer service, troubleshooting, account management",
      model: "GPT-4o"
    },
    {
      name: "Analytics Agent",
      purpose: "Data analysis, insights, reporting",
      model: "GPT-5",
      parallel: true
    },
    {
      name: "Recommendation Agent", 
      purpose: "AI-driven suggestions and next steps",
      model: "GPT-5",
      parallel: true
    },
    {
      name: "Qualification Agent",
      purpose: "BANT scoring and lead assessment",
      model: "GPT-4o",
      subgraph: true
    },
    {
      name: "UI Interaction Agent",
      purpose: "Form collection and user input management", 
      model: "GPT-4o",
      subgraph: true
    }
  ],
  flows: [
    "Single agent routing",
    "Parallel analytics + recommendations",
    "Sequential qualification process",
    "Interactive UI data collection",
    "Session persistence across conversations"
  ],
  capabilities: [
    "Multi-turn conversations with memory",
    "Confidence-based routing decisions",
    "Parallel agent execution",
    "State persistence with automatic cleanup",
    "UI interaction state machines",
    "Comprehensive conversation logging",
    "Stream-based responses"
  ]
};