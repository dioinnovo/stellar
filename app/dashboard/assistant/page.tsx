'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Brain, Sparkles, FileText, Calculator, Shield, 
  AlertTriangle, DollarSign, Scale, Clock, Lightbulb,
  BookOpen, HelpCircle, Target, TrendingUp, User, Bot,
  ChevronLeft, ChevronRight, Plus, MessageSquare, Hash,
  Users, FileSearch
} from 'lucide-react'
import { ChatGPTPromptInput } from '@/components/ui/chatgpt-prompt-input'
import SiriOrb from '@/components/ui/siri-orb'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
}

export default function AssistantPage() {
  const [currentChatId, setCurrentChatId] = useState<string>('1')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'New Chat',
      timestamp: new Date(),
      messages: []
    }
  ])
  
  const currentChat = chats.find(chat => chat.id === currentChatId) || chats[0]
  const [messages, setMessages] = useState<Message[]>(currentChat.messages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickActions = [
    {
      icon: '📊',
      title: 'Revenue Analysis',
      prompt: 'Show me our revenue performance this month with key metrics and trends'
    },
    {
      icon: '🎯',
      title: 'Claim Pipeline',
      prompt: 'What are our highest-value claims in the pipeline and their settlement potential?'
    },
    {
      icon: '👥',
      title: 'Team Performance',
      prompt: 'How is our team performing? Show productivity metrics and improvement areas'
    },
    {
      icon: '📈',
      title: 'Market Intelligence',
      prompt: 'What are the latest market trends and regulatory updates affecting our business?'
    },
    {
      icon: '⚖️',
      title: 'Settlement Strategy',
      prompt: 'Analyze our negotiation opportunities and recommend strategies for maximum recovery'
    },
    {
      icon: '🛡️',
      title: 'Compliance Check',
      prompt: 'Are there any compliance issues or deadlines I should be aware of?'
    },
    {
      icon: '🔍',
      title: 'Claim Research',
      prompt: 'Research comparable settlements and industry benchmarks for our active claims'
    },
    {
      icon: '💰',
      title: 'ROI Optimization',
      prompt: 'Which claims offer the best ROI potential and what actions should we prioritize?'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    
    // Update chat title if it's the first message
    if (messages.length === 0) {
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, title: messageText.substring(0, 30) + '...', messages: newMessages }
          : chat
      ))
    } else {
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: newMessages }
          : chat
      ))
    }
    
    setInput('')
    setIsTyping(true)

    // Call the specialized Stella AI API
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions || []
      }
      
      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: updatedMessages }
          : chat
      ))
      setIsTyping(false)
    } catch (error) {
      console.error('Error calling Stella AI:', error)
      
      // Fallback error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to my systems right now. Please try again in a moment, or contact support if the issue persists.',
        timestamp: new Date(),
        suggestions: ['Check system status', 'Try again', 'Contact support']
      }
      
      const updatedMessages = [...newMessages, errorMessage]
      setMessages(updatedMessages)
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: updatedMessages }
          : chat
      ))
      setIsTyping(false)
    }
  }


  const handleQuickAction = (prompt: string) => {
    handleSend(prompt)
  }
  
  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: new Date()
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    setMessages([])
  }
  
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setMessages(chat.messages)
    }
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex bg-gray-50">
      {/* Chat History Sidebar */}
      <motion.div 
        animate={{ width: isSidebarCollapsed ? 60 : 260 }}
        className="bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <button
                onClick={createNewChat}
                className="flex-1 flex items-center gap-2 px-3 py-2 bg-stellar-orange text-white rounded-lg hover:bg-red-600 transition"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">New Chat</span>
              </button>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-2 hover:bg-gray-100 rounded-lg transition ${isSidebarCollapsed ? 'mx-auto' : 'ml-2'}`}
            >
              {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {!isSidebarCollapsed ? (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${
                    currentChatId === chat.id 
                      ? 'bg-gray-100 border-l-2 border-stellar-orange' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare size={16} className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500">
                      {chat.timestamp.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`w-full p-2 rounded-lg transition ${
                    currentChatId === chat.id 
                      ? 'bg-gray-100' 
                      : 'hover:bg-gray-50'
                  }`}
                  title={chat.title}
                >
                  <MessageSquare size={18} className="text-gray-500 mx-auto" />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        {/* Welcome Screen or Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl"
              >
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <SiriOrb size="80px" animationDuration={8} isActive={true} />
                </div>
                
                <h1 className="text-4xl font-bold text-stellar-dark mb-3">
                  Welcome to Stella AI Copilot
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Your AI-powered business copilot for claim intelligence, team performance, and strategic insights
                </p>
                
                {/* Floating Quick Actions */}
                <div className="flex flex-wrap gap-3 justify-center mb-12">
                  {quickActions.map((action, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-stellar-orange hover:shadow-lg transition-all flex items-center gap-2 group"
                    >
                      <span className="text-lg">{action.icon}</span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-stellar-orange">
                        {action.title}
                      </span>
                    </motion.button>
                  ))}
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>I can help you with:</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-left max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-stellar-orange" size={16} />
                      <span>Revenue & financial analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileSearch className="text-stellar-orange" size={16} />
                      <span>Claim status & pipeline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="text-stellar-orange" size={16} />
                      <span>Team performance metrics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-stellar-orange" size={16} />
                      <span>Market intelligence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scale className="text-stellar-orange" size={16} />
                      <span>Settlement optimization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="text-stellar-orange" size={16} />
                      <span>Compliance monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="text-stellar-orange" size={16} />
                      <span>Strategic insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="text-stellar-orange" size={16} />
                      <span>Industry research</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Messages View */
            <div className="p-8 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <SiriOrb size="32px" animationDuration={6} isActive={true} />
                      </div>
                    )}
                    
                    <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user' 
                          ? 'bg-stellar-orange text-white' 
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      </div>
                      
                      {message.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(suggestion)}
                              className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-stellar-orange hover:text-stellar-orange transition"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-2 px-2">
                        {message.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-stellar-orange/10 rounded-full flex items-center justify-center">
                        <User className="text-stellar-orange" size={18} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-stellar-orange to-red-600 rounded-full flex items-center justify-center">
                    <Bot className="text-white" size={18} />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Quick Actions for active chat */}
              {messages.length > 0 && messages.length < 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2 justify-center mt-6"
                >
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-stellar-orange hover:shadow transition-all text-xs flex items-center gap-1.5"
                    >
                      <span>{action.icon}</span>
                      <span className="text-gray-700">{action.title}</span>
                    </button>
                  ))}
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <ChatGPTPromptInput
              onSubmit={(value, attachments) => {
                handleSend(value)
                if (attachments && attachments.length > 0) {
                  console.log('Files attached:', attachments)
                }
              }}
              placeholder="Ask about claim status, revenue metrics, team performance, market trends..."
              attachmentsEnabled={true}
              voiceEnabled={true}
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Stella AI Business Copilot • Real-time data • Web research enabled • Always verify critical decisions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}