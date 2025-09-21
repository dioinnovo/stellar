"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageSquare, Mic, Phone, PhoneOff, X, Send, ArrowUp, Mail, Smartphone } from "lucide-react"
import SiriOrb from "@/components/ui/siri-orb"
import { cn } from "@/lib/utils"
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice"
import { VoiceDebugPanel } from "@/components/voice-debug-panel"

interface Message {
  text: string
  isUser: boolean
  timestamp?: Date
}

interface VirtualAssistantConfig {
  apiEndpoint?: string
  apiKey?: string
  model?: string
  systemPrompt?: string
  useCallbackAgent?: boolean
}

const VirtualAssistant: React.FC<VirtualAssistantConfig> = ({
  apiEndpoint = process.env.NEXT_PUBLIC_AI_API_ENDPOINT || "/api/stella-leads/chat",
  apiKey = process.env.NEXT_PUBLIC_AI_API_KEY,
  model = process.env.NEXT_PUBLIC_AI_MODEL || "gpt-4o-mini",
  systemPrompt = "You are Stella, the elite Lead Generation Specialist for Stellar Adjusting. Your PRIMARY mission is to identify property owners who have been lowballed, denied, or delayed by their insurance company and convert them into clients. You work for a company that fights insurance companies to get people every dollar they deserve. Always focus on: 1) Identifying if they have an active claim, 2) Uncovering how their insurance company is screwing them, 3) Creating urgency around getting professional help, 4) Scheduling a free claim review. You only get paid when clients get more money - NO WIN, NO FEE. Be empathetic but results-focused, and always position Stellar as the solution to insurance company abuse.",
  useCallbackAgent = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")
  
  // Dynamic greeting system
  const [conversationStartMethod, setConversationStartMethod] = useState<'text' | 'voice' | 'existing' | null>(null)
  const [showInitialGreeting, setShowInitialGreeting] = useState(false)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hasEngaged, setHasEngaged] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [localCallDuration, setLocalCallDuration] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const localTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Text input overlay for voice calls
  const [showTextInput, setShowTextInput] = useState<'email' | 'phone' | null>(null)
  const [textInputValue, setTextInputValue] = useState('')
  const textInputRef = useRef<HTMLInputElement>(null)
  const handleUiActionRef = useRef<(uiAction: any) => void>(() => {})
  
  // Generate or get session ID
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('chat_session_id');
      if (stored) return stored;
      const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('chat_session_id', newId);
      return newId;
    }
    return '';
  });
  
  // Voice call integration
  const {
    isConnected: isVoiceConnected,
    isConnecting: isVoiceConnecting,
    isCallActive,
    error: voiceError,
    transcripts: voiceTranscripts,
    currentTranscript,
    connect: connectVoice,
    disconnect: disconnectVoice,
    startCall,
    endCall,
    sendText,  // Add this to get the sendText function
    setContext: setVoiceContext,
    callDuration,
    connectionQuality
  } = useRealtimeVoice({
    sessionId,
    orchestratorEndpoint: apiEndpoint || '/api/orchestrate',
    onUiAction: (uiAction: any) => handleUiActionRef.current(uiAction),
    // Let the session API determine the correct voice ID based on provider
    voice: undefined
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize handleUiAction function
  useEffect(() => {
    handleUiActionRef.current = (uiAction: any) => {
      console.log('🎛️ UI Action received in component:', uiAction);
      if (uiAction.type === 'show_text_input') {
        // UI should appear AFTER agent finishes speaking
        // This is already handled by the queuing system in useRealtimeVoice
        console.log(`📝 Showing ${uiAction.inputType} input field`);
        setShowTextInput(uiAction.inputType);
        setTextInputValue('');
        setTimeout(() => textInputRef.current?.focus(), 100);
      } else if (uiAction.type === 'hide_text_input') {
        setShowTextInput(null);
        setTextInputValue('');
      } else if (uiAction.type === 'end_call') {
        console.log('🔴 Agent triggered call end - cleaning up microphone and connection...');
        // Hide any text input overlays
        setShowTextInput(null);
        setTextInputValue('');
        // End the call to properly release microphone
        endCall();
      }
    };
  }, [endCall]);

  // Sync local timer with voice call state
  useEffect(() => {
    if (isVoiceConnecting || isCallActive) {
      // Start local timer immediately when connecting starts
      if (!localTimerRef.current) {
        setLocalCallDuration(0);
        const startTime = Date.now();
        localTimerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setLocalCallDuration(elapsed);
        }, 100); // Update every 100ms for smoother display
      }
    } else {
      // Stop local timer when call ends
      if (localTimerRef.current) {
        clearInterval(localTimerRef.current);
        localTimerRef.current = null;
        setLocalCallDuration(0);
      }
    }

    // Cleanup on unmount
    return () => {
      if (localTimerRef.current) {
        clearInterval(localTimerRef.current);
        localTimerRef.current = null;
      }
    };
  }, [isVoiceConnecting, isCallActive]);

  // Initialize greeting when chat opens
  useEffect(() => {
    if (isOpen && !conversationStartMethod && messages.length === 0) {
      // Check if there's existing conversation context
      const hasExistingSession = sessionStorage.getItem('chat_session_id')
      const hasExistingMessages = false // Could check for persisted messages
      
      if (hasExistingSession && hasExistingMessages) {
        setConversationStartMethod('existing')
      } else {
        // Default to text method and show typing indicator then greeting
        setConversationStartMethod('text')
        setShowInitialGreeting(true)
        setShowTypingIndicator(true)
        
        // After delay, hide typing indicator and show actual greeting
        setTimeout(() => {
          setShowTypingIndicator(false)
          setMessages([{
            text: "Hi! I'm Stella from Stellar Adjusting. I help property owners who are getting lowballed, delayed, or denied by their insurance companies. If you have an active claim or recent property damage, I can tell you right now if your insurance company is trying to screw you over. What's going on with your claim?",
            isUser: false,
            timestamp: new Date()
          }])
        }, 1500) // 1.5 second delay for typing effect
      }
    }
  }, [isOpen, conversationStartMethod, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // Add voice transcripts to messages with smart greeting handling
  useEffect(() => {
    if (voiceTranscripts.length > 0) {
      const lastTranscript = voiceTranscripts[voiceTranscripts.length - 1];
      
      // UI actions are now handled exclusively through the orchestrator
      // The agent's response will trigger UI actions at the appropriate time
      // This ensures the UI appears AFTER the agent finishes speaking
      // No automatic UI triggering based on keywords - only via UI actions from orchestrator
      
      // Detect if this is a greeting from the assistant
      const isAssistantGreeting = lastTranscript.role === 'assistant' && 
        (lastTranscript.text.toLowerCase().includes('hey there') || 
         lastTranscript.text.toLowerCase().includes('welcome to innovoco') ||
         (lastTranscript.text.toLowerCase().includes('hi') && lastTranscript.text.toLowerCase().includes('innovoco')));
      
      // Skip assistant greetings if we already have a text greeting or if voice is first
      if (isAssistantGreeting && conversationStartMethod === 'text' && showInitialGreeting) {
        return; // Don't add voice greeting if text greeting is showing/shown
      }
      
      // Skip assistant greetings if it's the very first message in a voice-first conversation
      if (isAssistantGreeting && conversationStartMethod === 'voice' && messages.length === 0) {
        return; // Let the voice greeting be heard but not displayed as text initially
      }
      
      // Check if this transcript is already in messages to avoid duplicates
      const exists = messages.some(msg => {
        // Exact text match
        if (msg.text === lastTranscript.text && msg.isUser === (lastTranscript.role === 'user')) {
          return true;
        }
        return false;
      });
      
      if (!exists) {
        const newMessage: Message = {
          text: lastTranscript.text,
          isUser: lastTranscript.role === 'user',
          timestamp: lastTranscript.timestamp
        };
        setMessages(prev => [...prev, newMessage]);
        
        // For voice-first conversations, add the greeting after the first meaningful exchange
        if (isAssistantGreeting && conversationStartMethod === 'voice' && messages.length > 0) {
          // This means we've had some interaction, so now show the greeting in text too
          // (This handles the case where voice greeting happened first but now we want it in chat history)
        }
      }
    }
  }, [voiceTranscripts, conversationStartMethod, showInitialGreeting, messages.length, isCallActive])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px` // Max height of 120px
    }
  }, [inputValue])


  const sendMessageToAPI = async (userMessage: string) => {
    try {
      // Use the provided endpoint or fallback to orchestrate
      const endpoint = apiEndpoint || '/api/orchestrate'
      
      let requestBody: any
      let headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Detect endpoint type and format request accordingly
      const isN8nEndpoint = endpoint.includes('/api/chat/n8n')
      const isOrchestrateEndpoint = endpoint.includes('/api/orchestrate')
      
      if (isOrchestrateEndpoint) {
        // Unified orchestrate format (LangGraph)
        requestBody = {
          message: userMessage,
          sessionId: sessionStorage.getItem('chat_session_id') || undefined,
          conversationType: 'chat',
          metadata: {
            source: 'web_chat',
            platform: 'innovoco_website',
            language: navigator.language || 'en'
          }
        }
      } else if (isN8nEndpoint) {
        // N8N webhook format
        requestBody = {
          message: userMessage,
          sessionId: sessionStorage.getItem('chat_session_id') || undefined,
          userId: sessionStorage.getItem('user_id') || undefined,
          metadata: {
            source: 'web_chat',
            platform: 'innovoco_website',
            language: 'en'
          }
        }
      } else {
        // Default format for unknown endpoints
        requestBody = {
          message: userMessage,
          sessionId: sessionStorage.getItem('chat_session_id') || undefined,
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (!response.ok) {
        // If there's a response message in the error, use it
        if (data.response) {
          return data.response
        }
        throw new Error(`API request failed: ${response.status}`)
      }
      
      // Store session ID from unified orchestrate response
      if (data.sessionId) {
        sessionStorage.setItem('chat_session_id', data.sessionId)
      }
      
      // Handle unified orchestrate response format
      if (data.response) {
        // Show qualification status in console for debugging
        if (data.qualification) {
          console.log('Lead Qualification:', {
            qualified: data.qualification.isQualified,
            score: data.qualification.score,
            tier: data.qualification.tier,
            reasons: data.qualification.reasons
          })
        }
        
        // Show analytics in console for debugging
        if (data.analytics) {
          console.log('Conversation Analytics:', data.analytics)
        }
        
        return data.response
      } else {
        throw new Error("Unexpected API response format")
      }
    } catch (error) {
      console.error("Error calling AI API:", error)
      return "I apologize, but I'm having trouble connecting to the AI service right now. Please try again later or contact our support team for immediate assistance."
    }
  }

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage = inputValue.trim()
      setInputValue("")
      setIsLoading(true)
      
      // Mark conversation as text-initiated if this is the first user message
      if (!hasEngaged && conversationStartMethod !== 'voice') {
        setConversationStartMethod('text');
      }
      
      // Mark as engaged after first message
      if (!hasEngaged) {
        setHasEngaged(true)
      }
      
      // Add user message
      const newUserMessage: Message = { 
        text: userMessage, 
        isUser: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newUserMessage])
      
      // Get AI response
      const aiResponse = await sendMessageToAPI(userMessage)
      
      // Add AI response
      const newAiMessage: Message = { 
        text: aiResponse, 
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newAiMessage])
      setIsLoading(false)
    }
  }

  const handleTextInputSubmit = async () => {
    if (textInputValue.trim() && showTextInput) {
      const value = textInputValue.trim();
      const inputType = showTextInput;
      
      // IMMEDIATELY hide the input overlay - typed input is trusted
      console.log(`📝 Submitting ${inputType} and closing UI immediately:`, value);
      
      // Clear the input AND hide the overlay immediately
      setTextInputValue('');
      setShowTextInput(null);
      
      // Send the typed value through the voice conversation
      // We'll format it as if the user spoke it
      const formattedMessage = inputType === 'email' 
        ? `My email is ${value}`
        : `My phone number is ${value}`;
      
      // Add to messages to show what was submitted
      const newMessage: Message = {
        text: formattedMessage,
        isUser: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      
      // CRITICAL: If voice call is active, send through voice agent's sendText method
      if (isCallActive && sendText) {
        console.log(`📝 Sending ${inputType} through voice agent:`, formattedMessage);
        // This will trigger the voice agent to process it properly
        // sendText is now async for Hume to work with orchestrator
        await sendText(formattedMessage);
      } else if (!isCallActive) {
        console.warn('⚠️ Voice call is not active, using fallback sync API');
        // Fallback: Send through voice conversation sync API
        try {
          const response = await fetch('/api/realtime/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              transcript: formattedMessage,
              role: 'user',
              timestamp: new Date().toISOString(),
              metadata: {
                source: 'text_input_during_voice',
                inputType
              }
            })
          });
          
          if (response.ok) {
            console.log(`✅ ${inputType} submitted via sync API:`, value);
            
            // Check if there are new UI actions from the response
            const data = await response.json();
            if (data.uiAction) {
              handleUiActionRef.current(data.uiAction);
            }
          }
        } catch (error) {
          console.error('Error submitting text input:', error);
        }
      }
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening)
    if (!isListening) {
      // Speech recognition implementation
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.continuous = false
        recognition.interimResults = false
        
        // Try multiple language options for better compatibility
        try {
          // Get user's browser language
          const userLang = navigator.language || 'en-US'
          recognition.lang = userLang
        } catch (e) {
          // Fallback to en-US if browser language fails
          recognition.lang = 'en-US'
        }
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputValue(transcript)
          setIsListening(false)
        }
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          
          // Provide user-friendly error messages
          let errorMessage = "Voice recognition encountered an error"
          switch(event.error) {
            case 'language-not-supported':
              errorMessage = "Your browser language is not supported for voice input"
              break
            case 'not-allowed':
              errorMessage = "Microphone access was denied"
              break
            case 'no-speech':
              errorMessage = "No speech was detected"
              break
            case 'network':
              errorMessage = "Network error occurred"
              break
          }
          
          // Optionally show error to user (you could add a toast notification here)
          console.log(errorMessage)
          
          setIsListening(false)
        }
        
        recognition.onend = () => {
          setIsListening(false)
        }
        
        try {
          recognition.start()
        } catch (error) {
          console.error('Failed to start speech recognition:', error)
          setIsListening(false)
        }
      } else {
        console.log("Speech recognition not supported in this browser")
        // Could show a user notification here
        setIsListening(false)
      }
    }
  }

  return (
    <>
      {/* Floating Orb Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50",
          "transition-all duration-300 hover:scale-110",
          "drop-shadow-2xl",
          "rounded-full bg-white dark:bg-[#2C3E50]",
          "p-1",
          "print:hidden",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
        aria-label="Open virtual assistant"
      >
        <SiriOrb 
          size={isMobile ? "56px" : "112px"} 
          animationDuration={8}
          isActive={!isOpen}
        />
      </button>

      {/* Chat Interface */}
      <div
        className={cn(
          "fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50",
          "w-96 h-[600px] max-h-[80vh]",
          // Mobile responsive styles
          "sm:w-96 sm:h-[600px] sm:right-6 sm:bottom-6 sm:rounded-[40px]",
          "max-sm:w-[calc(100vw-32px)] max-sm:h-[500px] max-sm:right-4 max-sm:bottom-4",
          // Fullscreen on mobile when voice is active
          (isVoiceConnecting || isCallActive) && "max-sm:w-screen max-sm:h-screen max-sm:right-0 max-sm:bottom-0 max-sm:rounded-none",
          "bg-white dark:bg-[#2C3E50]",
          "rounded-[40px] overflow-hidden",
          "shadow-[0_0_2px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.14)]",
          "flex flex-col",
          "transition-all duration-300",
          "border border-gray-200/50 dark:border-[#1a252f]/50",
          "backdrop-blur-sm",
          "print:hidden",
          !isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Phone Call UI Overlay */}
        {(isVoiceConnecting || isCallActive) && (
          <div className="absolute inset-0 z-10 bg-white/98 dark:bg-[#2C3E50]/98 flex flex-col items-center justify-center">
            {/* Connection Status Text */}
            <div className="absolute top-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {isVoiceConnecting ? "Establishing connection..." : "Voice Call Active"}
              </p>
              {(isCallActive || isVoiceConnecting) && (
                <p className="text-gray-900 dark:text-white text-2xl font-light mt-2 tabular-nums flex justify-center">
                  <span className="inline-flex items-center">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {formatCallDuration(localCallDuration || callDuration)}
                  </span>
                </p>
              )}
            </div>
            
            {/* Siri Orb - 3-second expansion animation during connection */}
            <div className="relative">
              <div className={cn(
                "transition-all ease-out",
                isVoiceConnecting ? "duration-[3000ms] scale-100" : // 3 seconds to full size when connecting
                isCallActive ? "duration-500 scale-100" : // Quick transition when active
                "duration-300 scale-75" // Default scale when neither
              )}>
                <SiriOrb 
                  size={isVoiceConnecting || isCallActive ? "200px" : "80px"} // Start small (80px) and grow to large (200px)
                  animationDuration={isCallActive ? 4 : isVoiceConnecting ? 3 : 2}
                  isActive={true}
                />
              </div>
              {isVoiceConnecting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Outer ripple effect during connection */}
                  <div className="w-64 h-64 rounded-full border border-gray-400/10 dark:border-gray-600/10 animate-ping" style={{ animationDuration: '3000ms' }} />
                  <div className="absolute w-48 h-48 rounded-full border border-gray-400/20 dark:border-gray-600/20 animate-ping" style={{ animationDuration: '3000ms', animationDelay: '500ms' }} />
                  <div className="absolute w-32 h-32 rounded-full border border-gray-400/30 dark:border-gray-600/30 animate-ping" style={{ animationDuration: '3000ms', animationDelay: '1000ms' }} />
                </div>
              )}
            </div>
            
            {/* Call Status */}
            <div className="absolute bottom-32 text-center">
              <p className="text-gray-500 dark:text-gray-500 text-xs">
                {isVoiceConnecting ? "Initializing AI assistant..." : 
                 currentTranscript ? "Listening..." : "Ready to chat"}
              </p>
            </div>
            
            {/* Text Input Overlay for Email/Phone */}
            {showTextInput && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    {showTextInput === 'email' ? (
                      <Mail className="w-6 h-6 text-[#E74C3C] dark:text-[#EF6B68]" />
                    ) : (
                      <Smartphone className="w-6 h-6 text-[#E74C3C] dark:text-[#EF6B68]" />
                    )}
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Please type your {showTextInput === 'email' ? 'email address' : 'phone number'}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    For accuracy, please type your {showTextInput} below
                  </p>
                  
                  <div className="space-y-3">
                    <input
                      ref={textInputRef}
                      type={showTextInput === 'email' ? 'email' : 'tel'}
                      value={textInputValue}
                      onChange={(e) => setTextInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTextInputSubmit();
                        }
                      }}
                      placeholder={showTextInput === 'email' ? 'your@email.com' : '(555) 123-4567'}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E74C3C] dark:focus:ring-[#EF6B68]"
                      autoFocus
                    />
                    <button
                      onClick={handleTextInputSubmit}
                      disabled={!textInputValue.trim()}
                      className={cn(
                        "w-full px-6 py-3 rounded-xl font-medium transition-all duration-200",
                        textInputValue.trim()
                          ? "bg-[#E74C3C] hover:bg-[#D13328] text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      )}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Hang Up Button */}
            <div className="absolute bottom-12">
              <button
                onClick={() => {
                  setShowTextInput(null); // Hide any text input when ending call
                  endCall();
                }}
                className="group p-5 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-110 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                aria-label="End call"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}
        {/* Header - Hide during voice call */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-[#1a252f]/50 bg-gradient-to-r from-white/95 to-white/98 dark:from-[#2C3E50]/95 dark:to-[#2C3E50]/98",
          (isVoiceConnecting || isCallActive) && "hidden"
        )}>
          <div className="flex items-center gap-3">
            <SiriOrb 
              size={isMobile ? "32px" : "64px"} 
              animationDuration={5}
              isActive={isListening || isLoading}
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Stellar Assistant
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <span className="absolute inline-flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {isCallActive ? `Voice Call (${formatCallDuration(localCallDuration || callDuration)})` : 
                   isListening ? "Listening..." : 
                   isLoading ? "Thinking..." : "Online"}
                </p>
              </div>
              {/* System indicator */}
              <div className="mt-1">
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  apiEndpoint?.includes('orchestrate') ? "bg-[#E74C3C]/10 text-[#E74C3C] dark:bg-[#E74C3C]/20 dark:text-[#EF6B68]" :
                  apiEndpoint?.includes('n8n') ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" :
                  "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                )}>
                  {apiEndpoint?.includes('orchestrate') ? "🚀 LangGraph" :
                   apiEndpoint?.includes('n8n') ? "🔗 N8N" :
                   "🤖 Assistant"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:scale-110"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Messages Area - Hide during voice call */}
        <div className={cn(
          "flex-1 overflow-y-auto p-4 space-y-3",
          (isVoiceConnecting || isCallActive) && "hidden"
        )}>
          {/* Typing Indicator for Initial Greeting */}
          {showTypingIndicator && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] dark:from-[#34495e] dark:to-[#2C3E50] px-4 py-3 rounded-2xl border border-gray-200/50 dark:border-[#1a252f]/50">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          {/* Regular Messages */}
          {messages.map((message, index) => {
            // Generate suggested actions based on message content
            const getSuggestedActions = () => {
              if (message.isUser) return [];
              
              const text = message.text.toLowerCase();
              const actions = [];
              
              // Check for common patterns and suggest relevant actions
              if (text.includes('claim') || text.includes('insurance')) {
                actions.push('File a Claim', 'Check Claim Status', 'Upload Documents');
              }
              if (text.includes('damage') || text.includes('assessment')) {
                actions.push('Schedule Inspection', 'Get Estimate', 'View Coverage');
              }
              if (text.includes('help') || text.includes('assist')) {
                actions.push('Talk to Expert', 'View FAQ', 'Get Started');
              }
              if (text.includes('contact') || text.includes('reach')) {
                actions.push('Call Now', 'Schedule Meeting', 'Email Us');
              }
              if (text.includes('document') || text.includes('upload')) {
                actions.push('Upload Photos', 'Submit Policy', 'View Requirements');
              }
              if (index === 0 || (index === 1 && messages[0].isUser)) {
                // First assistant message - show general options
                actions.push('File a Claim', 'Get Free Analysis', 'Learn More');
              }
              
              return actions.slice(0, 3); // Limit to 3 suggestions
            };
            
            const suggestedActions = getSuggestedActions();
            
            return (
              <div key={index}>
                <div
                  className={cn(
                    "flex",
                    message.isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2.5 rounded-2xl",
                      "transition-all duration-300",
                      message.isUser
                        ? "bg-gradient-to-br from-[#E74C3C] to-[#EF6B68] text-white shadow-[0_2px_8px_rgba(231,76,60,0.25)]"
                        : "bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] dark:from-[#34495e] dark:to-[#2C3E50] text-gray-900 dark:text-white border border-gray-200/50 dark:border-[#1a252f]/50"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    {message.timestamp && mounted && (
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Suggested Actions Pills - Show after assistant messages */}
                {!message.isUser && suggestedActions.length > 0 && index === messages.length - 1 && !isLoading && (
                  <div className="flex justify-start mt-2 ml-0">
                    <div className="flex flex-wrap gap-2 max-w-[80%]">
                      {suggestedActions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={async () => {
                            if (isLoading) return; // Prevent clicking while loading
                            
                            setIsLoading(true);
                            
                            // Mark as engaged after first interaction
                            if (!hasEngaged) {
                              setHasEngaged(true);
                              setConversationStartMethod('text');
                            }
                            
                            // Add user message
                            const newUserMessage: Message = {
                              text: action,
                              isUser: true,
                              timestamp: new Date()
                            };
                            setMessages(prev => [...prev, newUserMessage]);
                            
                            try {
                              // Get AI response
                              const aiResponse = await sendMessageToAPI(action);
                              
                              // Add AI response
                              const newAiMessage: Message = {
                                text: aiResponse,
                                isUser: false,
                                timestamp: new Date()
                              };
                              setMessages(prev => [...prev, newAiMessage]);
                            } catch (error) {
                              console.error('Error sending message:', error);
                              // Add error message
                              const errorMessage: Message = {
                                text: 'Sorry, I encountered an error. Please try again.',
                                isUser: false,
                                timestamp: new Date()
                              };
                              setMessages(prev => [...prev, errorMessage]);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading}
                          className="px-3 py-1.5 bg-white dark:bg-[#34495e] border border-stellar-orange/30 text-stellar-orange dark:text-stellar-orange rounded-full text-xs font-medium hover:bg-stellar-orange hover:text-white hover:border-stellar-orange transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] dark:from-[#34495e] dark:to-[#2C3E50] px-4 py-3 rounded-2xl border border-gray-200/50 dark:border-[#1a252f]/50">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          {/* Show current voice transcript as it's being spoken */}
          {isCallActive && currentTranscript && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] dark:from-gray-800 dark:to-gray-700 px-4 py-3 rounded-2xl border border-[#10B981]/30 dark:border-[#10B981]/30 animate-pulse">
                <p className="text-gray-700 dark:text-gray-200">{currentTranscript}</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Hide during voice call */}
        <div className={cn(
          "p-4 border-t border-gray-200 dark:border-[#1a252f]/50 bg-white dark:bg-[#2C3E50]",
          (isVoiceConnecting || isCallActive) && "hidden"
        )}>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                if (isCallActive) {
                  endCall();
                } else {
                  // Detect voice-first conversation
                  if (!conversationStartMethod || conversationStartMethod === 'text') {
                    setConversationStartMethod('voice');
                    setShowInitialGreeting(false); // Don't show text greeting for voice-first
                  }
                  
                  // Check if there's meaningful conversation history
                  const hasMeaningfulHistory = messages.length > 0 && 
                    messages.some(msg => msg.isUser); // Has user messages
                  
                  // Start the call with context awareness  
                  await startCall();
                  
                  // Send existing conversation context if there is any
                  if (hasMeaningfulHistory) {
                    setTimeout(() => {
                      console.log('Sending conversation context to voice:', messages.length, 'messages');
                      setVoiceContext(messages);
                    }, 500); // Small delay to ensure connection is ready
                  }
                }
              }}
              disabled={isLoading || isVoiceConnecting}
              className={cn(
                "group p-2.5 rounded-full transition-all duration-300",
                isCallActive
                  ? "bg-gradient-to-br from-[#DC2626] to-[#EF4444] animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  : "bg-gradient-to-br from-[#E74C3C] to-[#EF6B68] hover:shadow-[0_0_12px_rgba(231,76,60,0.3)]",
                "hover:scale-105",
                "border",
                isCallActive ? "border-[#DC2626]/30" : "border-[#E74C3C]/20",
                (isLoading || isVoiceConnecting) && "opacity-50 cursor-not-allowed"
              )}
              aria-label={isCallActive ? "End voice call" : "Start voice call"}
              title={isCallActive ? `Voice Call Active (${formatCallDuration(localCallDuration || callDuration)})` : "Start Voice Call"}
            >
              {isCallActive ? (
                <PhoneOff className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <Phone className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
            
            <div className="flex-1 relative flex items-start">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (!isLoading && inputValue.trim()) {
                      handleSend()
                    }
                  }
                }}
                placeholder={isLoading ? "Processing your request..." : (hasEngaged ? "Ask about your claim..." : "How can I help with your insurance claim?")}
                disabled={isLoading}
                rows={1}
                className="w-full pl-5 pr-14 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 disabled:opacity-50 focus:bg-white dark:focus:bg-gray-700 focus:border-stellar-orange dark:focus:border-stellar-orange focus:outline-none focus:ring-1 focus:ring-stellar-orange/20 resize-none overflow-hidden"
                style={{ 
                  minHeight: '44px', 
                  maxHeight: '120px'
                }}
              />
              <button
                onClick={inputValue.trim() ? handleSend : toggleVoice}
                disabled={isLoading}
                className={cn(
                  "absolute right-2 p-2 rounded-full transition-all duration-300",
                  inputValue.trim() 
                    ? "bg-[#E74C3C] hover:bg-[#D13328] text-white"
                    : isListening
                      ? "bg-gradient-to-br from-[#DC2626] to-[#EF4444] text-white shadow-[0_0_8px_rgba(220,38,38,0.3)]"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                style={{ top: '50%', transform: 'translateY(-50%)' }}
                aria-label={inputValue.trim() ? "Send message" : (isListening ? "Stop recording" : "Start voice recording")}
              >
                {inputValue.trim() ? (
                  isLoading ? (
                    <div className="flex gap-0.5">
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <MessageSquare className="w-3 h-3 inline mr-1" />
              Chat
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <Mic className="w-3 h-3 inline mr-1" />
              Voice
            </button>
          </div>
        </div>
      </div>

      {/* Voice Debug Panel */}
      <div className="print:hidden">
        <VoiceDebugPanel
          isConnected={isVoiceConnected}
          isCallActive={isCallActive}
          connectionQuality={connectionQuality}
          error={voiceError}
          showDebug={showDebug && isOpen}
        />
      </div>
      
      {/* Mobile styles are handled by Tailwind responsive classes */}
    </>
  )
}

// Helper function to format call duration
function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default VirtualAssistant