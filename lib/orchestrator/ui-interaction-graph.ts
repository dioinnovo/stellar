/**
 * UI Interaction Sub-Graph for Proper Email/Phone Collection
 * 
 * Implements the correct flow:
 * 1. Agent verbally asks for email
 * 2. Push UI tool for email input
 * 3. Wait for user submission
 * 4. Confirm receipt and echo back
 * 5. Repeat for phone number
 * 
 * Based on LangGraph functional API patterns
 */

import { StateGraph, Annotation, END } from '@langchain/langgraph';
import { BaseMessage, AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { MasterOrchestratorState } from './state';

/**
 * UI interaction states
 */
export enum UIInteractionState {
  IDLE = 'idle',
  ASKING_EMAIL = 'asking_email',
  WAITING_EMAIL = 'waiting_email',
  CONFIRMING_EMAIL = 'confirming_email',
  ASKING_PHONE = 'asking_phone',
  WAITING_PHONE = 'waiting_phone',
  CONFIRMING_PHONE = 'confirming_phone',
  COMPLETED = 'completed',
}

/**
 * UI Tool Call Structure
 */
export interface UIToolCall {
  type: 'push_ui' | 'close_ui';
  inputType?: 'email' | 'phone' | 'text';
  placeholder?: string;
  message?: string;
}

/**
 * Enhanced state for UI interactions
 */
const UIInteractionAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    value: (current, update) => {
      if (!update) return current;
      return Array.isArray(update) ? [...current, ...update] : [...current, update];
    },
    default: () => [],
  }),
  
  uiState: Annotation<UIInteractionState>({
    value: (current, update) => update ?? current,
    default: () => UIInteractionState.IDLE,
  }),
  
  collectedEmail: Annotation<string | null>({
    value: (current, update) => update ?? current,
    default: () => null,
  }),
  
  collectedPhone: Annotation<string | null>({
    value: (current, update) => update ?? current,
    default: () => null,
  }),
  
  awaitingUIResponse: Annotation<boolean>({
    value: (current, update) => update ?? current,
    default: () => false,
  }),
  
  lastUIToolCall: Annotation<UIToolCall | null>({
    value: (current, update) => update ?? current,
    default: () => null,
  }),
});

type UIState = typeof UIInteractionAnnotation.State;

/**
 * Ask for email verbally and push UI
 */
async function askEmailNode(state: UIState): Promise<Partial<UIState>> {
  console.log('📧 Asking for email...');
  
  // Verbal request for email - UI action will be sent separately after speech
  const askMessage = new AIMessage({
    content: "I'd be happy to have our AI strategist reach out with specific solutions for your needs. What's the best email address to reach you? I'll open a form for you to enter it securely.",
    // Don't include UI action here - it should be triggered after the speech
    additional_kwargs: {
      // Mark this as a message that should trigger UI after speaking
      pending_ui_action: {
        type: 'push_ui',
        inputType: 'email',
        placeholder: 'your@email.com',
      },
    },
  });
  
  // Push UI tool call
  const toolCall: UIToolCall = {
    type: 'push_ui',
    inputType: 'email',
    placeholder: 'your@email.com',
    message: 'Please enter your email address',
  };
  
  return {
    messages: [askMessage],
    uiState: UIInteractionState.WAITING_EMAIL,
    awaitingUIResponse: true,
    lastUIToolCall: toolCall,
  };
}

/**
 * Wait for email submission
 */
async function waitEmailNode(state: UIState): Promise<Partial<UIState>> {
  console.log('⏳ Waiting for email submission...');
  
  // Check if we have a new message with email
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (lastMessage && lastMessage._getType() === 'human') {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const content = lastMessage.content.toString();
    const emailMatch = content.match(emailPattern);
    
    if (emailMatch) {
      const email = emailMatch[0].toLowerCase();
      console.log(`✅ Email received: ${email}`);
      
      return {
        collectedEmail: email,
        uiState: UIInteractionState.CONFIRMING_EMAIL,
        awaitingUIResponse: false,
      };
    }
  }
  
  // Still waiting
  return {
    messages: [
      new AIMessage("Let me know when you've entered your email address."),
    ],
  };
}

/**
 * Confirm email receipt and close UI
 */
async function confirmEmailNode(state: UIState): Promise<Partial<UIState>> {
  console.log('✅ Confirming email...');
  
  const closeToolCall: UIToolCall = {
    type: 'close_ui',
  };
  
  const confirmMessage = new AIMessage({
    content: `Perfect! I have your email as ${state.collectedEmail}. Thank you for providing that.`,
    additional_kwargs: {
      ui_action: closeToolCall,
    },
  });
  
  return {
    messages: [confirmMessage],
    uiState: UIInteractionState.ASKING_PHONE,
    lastUIToolCall: closeToolCall,
  };
}

/**
 * Ask for phone verbally and push UI
 */
async function askPhoneNode(state: UIState): Promise<Partial<UIState>> {
  console.log('📱 Asking for phone...');
  
  const askMessage = new AIMessage({
    content: "Now, what's the best phone number for our strategist to reach you? I'll open another form for you to enter it.",
    // Don't include UI action here - it should be triggered after the speech
    additional_kwargs: {
      // Mark this as a message that should trigger UI after speaking
      pending_ui_action: {
        type: 'push_ui',
        inputType: 'phone',
        placeholder: '(555) 123-4567',
      },
    },
  });
  
  const toolCall: UIToolCall = {
    type: 'push_ui',
    inputType: 'phone',
    placeholder: '(555) 123-4567',
    message: 'Please enter your phone number',
  };
  
  return {
    messages: [askMessage],
    uiState: UIInteractionState.WAITING_PHONE,
    awaitingUIResponse: true,
    lastUIToolCall: toolCall,
  };
}

/**
 * Wait for phone submission
 */
async function waitPhoneNode(state: UIState): Promise<Partial<UIState>> {
  console.log('⏳ Waiting for phone submission...');
  
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (lastMessage && lastMessage._getType() === 'human') {
    const phonePattern = /[\d\s\-\(\)\+\.]+/;
    const content = lastMessage.content.toString();
    const phoneMatch = content.match(phonePattern);
    
    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
      const phone = phoneMatch[0].trim();
      console.log(`✅ Phone received: ${phone}`);
      
      return {
        collectedPhone: phone,
        uiState: UIInteractionState.CONFIRMING_PHONE,
        awaitingUIResponse: false,
      };
    }
  }
  
  return {
    messages: [
      new AIMessage("Let me know when you've entered your phone number."),
    ],
  };
}

/**
 * Confirm phone receipt and close UI
 */
async function confirmPhoneNode(state: UIState): Promise<Partial<UIState>> {
  console.log('✅ Confirming phone...');
  
  const closeToolCall: UIToolCall = {
    type: 'close_ui',
  };
  
  const confirmMessage = new AIMessage({
    content: `Excellent! I have your phone number as ${state.collectedPhone}. Our AI strategist will reach out to you shortly at both ${state.collectedEmail} and ${state.collectedPhone} to discuss how we can help with your automation needs.`,
    additional_kwargs: {
      ui_action: closeToolCall,
    },
  });
  
  return {
    messages: [confirmMessage],
    uiState: UIInteractionState.COMPLETED,
    lastUIToolCall: closeToolCall,
  };
}

/**
 * Router for UI interaction flow
 */
function routeUIInteraction(state: UIState): string | typeof END {
  switch (state.uiState) {
    case UIInteractionState.IDLE:
      return 'ask_email';
    
    case UIInteractionState.WAITING_EMAIL:
      // Check if email was received
      if (state.collectedEmail) {
        return 'confirm_email';
      }
      return 'wait_email';
    
    case UIInteractionState.CONFIRMING_EMAIL:
      return 'ask_phone';
    
    case UIInteractionState.ASKING_PHONE:
      return 'ask_phone';
    
    case UIInteractionState.WAITING_PHONE:
      // Check if phone was received
      if (state.collectedPhone) {
        return 'confirm_phone';
      }
      return 'wait_phone';
    
    case UIInteractionState.CONFIRMING_PHONE:
    case UIInteractionState.COMPLETED:
      return END;
    
    default:
      return END;
  }
}

/**
 * Build the UI interaction sub-graph
 */
export function buildUIInteractionGraph() {
  const workflow = new StateGraph(UIInteractionAnnotation)
    // Add nodes
    .addNode('ask_email', askEmailNode)
    .addNode('wait_email', waitEmailNode)
    .addNode('confirm_email', confirmEmailNode)
    .addNode('ask_phone', askPhoneNode)
    .addNode('wait_phone', waitPhoneNode)
    .addNode('confirm_phone', confirmPhoneNode)
    
    // Set entry point
    .addEdge('__start__', 'ask_email')
    
    // Add conditional routing
    .addConditionalEdges('ask_email', (state) => 
      state.awaitingUIResponse ? 'wait_email' : 'confirm_email'
    )
    .addConditionalEdges('wait_email', (state) =>
      state.collectedEmail ? 'confirm_email' : 'wait_email'
    )
    .addEdge('confirm_email', 'ask_phone')
    .addConditionalEdges('ask_phone', (state) =>
      state.awaitingUIResponse ? 'wait_phone' : 'confirm_phone'
    )
    .addConditionalEdges('wait_phone', (state) =>
      state.collectedPhone ? 'confirm_phone' : 'wait_phone'
    )
    .addEdge('confirm_phone', END);
  
  return workflow.compile();
}

/**
 * Helper to check if UI interaction is needed
 */
export function shouldTriggerUICollection(state: MasterOrchestratorState): boolean {
  // Check if we need to collect contact info
  const hasEmail = !!state.customerInfo?.email;
  const hasPhone = !!state.customerInfo?.phone;
  const hasChallenges = !!(state.customerInfo?.currentChallenges &&
                        state.customerInfo.currentChallenges.length > 0);

  // Trigger UI collection when we have business context but no contact
  return !hasEmail && !hasPhone && hasChallenges;
}

/**
 * Run UI interaction flow
 */
export async function runUIInteraction(
  currentMessages: BaseMessage[]
): Promise<{
  email: string | null;
  phone: string | null;
  messages: BaseMessage[];
  uiCalls: UIToolCall[];
}> {
  const graph = buildUIInteractionGraph();
  
  const result = await graph.invoke({
    messages: currentMessages,
    uiState: UIInteractionState.IDLE,
    collectedEmail: null,
    collectedPhone: null,
    awaitingUIResponse: false,
    lastUIToolCall: null,
  });
  
  // Extract UI tool calls from messages
  const uiCalls: UIToolCall[] = [];
  result.messages.forEach((msg: BaseMessage) => {
    const uiAction = msg.additional_kwargs?.ui_action;
    if (uiAction && typeof uiAction === 'object' && 'type' in uiAction) {
      uiCalls.push(uiAction as UIToolCall);
    }
  });
  
  return {
    email: result.collectedEmail,
    phone: result.collectedPhone,
    messages: result.messages,
    uiCalls,
  };
}

/**
 * Handle UI response in main graph
 */
export async function handleUIResponse(
  state: MasterOrchestratorState,
  userInput: string
): Promise<Partial<MasterOrchestratorState>> {
  // Check what we're waiting for
  const waitingForEmail = state.latestUiAction?.inputType === 'email';
  const waitingForPhone = state.latestUiAction?.inputType === 'phone';
  
  if (waitingForEmail) {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = userInput.match(emailPattern);
    
    if (emailMatch) {
      const email = emailMatch[0].toLowerCase();
      
      return {
        customerInfo: {
          ...state.customerInfo,
          email,
        },
        messages: [
          new HumanMessage(userInput),
          new AIMessage(`Perfect! I have your email as ${email}. Thank you for providing that.`),
        ],
        latestUiAction: {
          type: 'hide_text_input',
          inputType: null,
          placeholder: null,
        },
      };
    }
  }
  
  if (waitingForPhone) {
    const phonePattern = /[\d\s\-\(\)\+\.]+/;
    const phoneMatch = userInput.match(phonePattern);
    
    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
      const phone = phoneMatch[0].trim();
      
      return {
        customerInfo: {
          ...state.customerInfo,
          phone,
        },
        messages: [
          new HumanMessage(userInput),
          new AIMessage(`Excellent! I have your phone number as ${phone}. Our team will be in touch soon!`),
        ],
        latestUiAction: {
          type: 'hide_text_input',
          inputType: null,
          placeholder: null,
        },
      };
    }
  }
  
  // Default - just add the message
  return {
    messages: [new HumanMessage(userInput)],
  };
}