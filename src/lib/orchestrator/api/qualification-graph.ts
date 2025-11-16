/**
 * LangGraph Studio API Export - Qualification Subgraph  
 * This file exposes the BANT qualification subgraph for detailed analysis
 */

import { buildQualificationSubgraph } from '../qualification-subgraph';

// Create and export the qualification subgraph
export const graph = buildQualificationSubgraph();

// Export metadata for visualization
export const metadata = {
  title: "BANT Qualification Subgraph",
  description: "Sequential lead qualification system using BANT methodology",
  version: "1.0.0",
  methodology: "BANT (Budget, Authority, Need, Timeline)",
  flow: "Sequential evaluation with scoring",
  nodes: [
    {
      name: "evaluate_budget",
      purpose: "Assess customer's budget capacity",
      scoring: "0-25 points based on budget alignment"
    },
    {
      name: "evaluate_authority", 
      purpose: "Determine decision-making authority",
      scoring: "0-25 points based on decision power"
    },
    {
      name: "evaluate_need",
      purpose: "Analyze business need and pain points", 
      scoring: "0-25 points based on need urgency"
    },
    {
      name: "evaluate_timeline",
      purpose: "Understand implementation timeline",
      scoring: "0-25 points based on timeline feasibility"
    },
    {
      name: "calculate_final_score",
      purpose: "Aggregate BANT scores and categorize lead",
      output: "Hot (80+), Warm (60-79), Cold (40-59), Unqualified (<40)"
    }
  ],
  edges: [
    "START → evaluate_budget",
    "evaluate_budget → evaluate_authority", 
    "evaluate_authority → evaluate_need",
    "evaluate_need → evaluate_timeline",
    "evaluate_timeline → calculate_final_score",
    "calculate_final_score → END"
  ],
  scoring_system: {
    total_points: 100,
    categories: {
      "Hot Lead": "80-100 points",
      "Warm Lead": "60-79 points", 
      "Cold Lead": "40-59 points",
      "Unqualified": "0-39 points"
    }
  },
  integration: "Called from main orchestrator when qualification is needed"
};