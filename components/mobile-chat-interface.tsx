'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Plus, 
  X,
  Menu,
  Clock,
  ChevronLeft,
  Send,
  ChevronDown,
  Paperclip,
  ArrowUp
} from 'lucide-react'
import SiriOrb from '@/components/ui/siri-orb'
import { cn } from '@/lib/utils'

// Custom Microphone SVG Component
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M16.7673 6.54284C16.7673 3.91128 14.634 1.77799 12.0024 1.77799C9.37089 1.77799 7.2376 3.91129 7.2376 6.54284L7.2376 13.5647C7.2376 16.1963 9.37089 18.3296 12.0024 18.3296C14.634 18.3296 16.7673 16.1963 16.7673 13.5647L16.7673 6.54284ZM12.0024 3.28268C13.803 3.28268 15.2626 4.7423 15.2626 6.54284L15.2626 13.5647C15.2626 15.3652 13.803 16.8249 12.0024 16.8249C10.2019 16.8249 8.74229 15.3652 8.74229 13.5647L8.74229 6.54284C8.74229 4.7423 10.2019 3.28268 12.0024 3.28268Z"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M20.0274 8.79987C19.6119 8.79987 19.2751 9.1367 19.2751 9.55221V13.5647C19.2751 17.5813 16.019 20.8374 12.0024 20.8374C7.98587 20.8374 4.72979 17.5813 4.72979 13.5647L4.72979 9.55221C4.72979 9.1367 4.39295 8.79987 3.97744 8.79987C3.56193 8.79987 3.2251 9.1367 3.2251 9.55221L3.2251 13.5647C3.2251 18.4123 7.15485 22.3421 12.0024 22.3421C16.85 22.3421 20.7798 18.4123 20.7798 13.5647V9.55221C20.7798 9.1367 20.443 8.79987 20.0274 8.79987Z"/>
  </svg>
)

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
  titleGenerated?: boolean
  description?: string
}

interface MobileChatInterfaceProps {
  className?: string
}

export default function MobileChatInterface({ className }: MobileChatInterfaceProps) {
  const [currentChatId, setCurrentChatId] = useState<string>('1')
  const [showHistoryModal, setShowHistoryModal] = useState(false)
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
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [animatedTitle, setAnimatedTitle] = useState(currentChat.title)
  const [titleIsAnimating, setTitleIsAnimating] = useState(false)
  const [selectedModel, setSelectedModel] = useState('quick')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  // Model options
  const modelOptions = [
    { value: 'quick', label: 'Quick', description: 'Fast responses' },
    { value: 'gpt4', label: 'GPT-4', description: 'Advanced reasoning' },
    { value: 'claude', label: 'Claude', description: 'Detailed analysis' }
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea when input changes
  useEffect(() => {
    adjustTextareaHeight()
  }, [inputValue])

  // Typing animation effect for title
  useEffect(() => {
    if (currentChat.title !== animatedTitle && currentChat.title !== 'New Chat') {
      setTitleIsAnimating(true)
      setAnimatedTitle('')
      
      let currentIndex = 0
      const targetTitle = currentChat.title
      const typingSpeed = 30 // Fast typing speed (30ms per character)
      
      const typeInterval = setInterval(() => {
        if (currentIndex < targetTitle.length) {
          setAnimatedTitle(targetTitle.substring(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(typeInterval)
          setTitleIsAnimating(false)
        }
      }, typingSpeed)
      
      return () => clearInterval(typeInterval)
    } else if (currentChat.title === 'New Chat') {
      setAnimatedTitle('New Chat')
    }
  }, [currentChat.title])

  // Generate chat title based on conversation context
  const generateChatTitle = async (chatMessages: Message[]) => {
    // Only generate if we have enough messages and haven't generated yet
    const chat = chats.find(c => c.id === currentChatId)
    // Skip if: no chat found, title already generated, not enough messages, or already has a proper title
    if (!chat || chat.titleGenerated || chatMessages.length < 3 || 
        (chat.title !== 'New Chat' && !chat.title.endsWith('...'))) return

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'Generate a brief, descriptive title (max 30 characters) for this conversation based on the main topic. Return only the title, no quotes or punctuation.' 
            },
            ...chatMessages.slice(0, 4).map(m => ({
              role: m.role,
              content: m.content.substring(0, 200)
            }))
          ],
          generateTitle: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        const title = data.title || data.response.substring(0, 30)
        
        setChats(prev => prev.map(c => 
          c.id === currentChatId 
            ? { ...c, title: title, titleGenerated: true }
            : c
        ))
      }
    } catch (error) {
      console.error('Error generating title:', error)
    }
  }

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim()
    if (!messageText) return
    
    // Clear input if using form input
    if (!text) {
      setInputValue('')
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    
    // Only update chat title if it's the first message AND the chat still has "New Chat" as title
    if (messages.length === 0 && currentChat.title === 'New Chat') {
      const truncatedTitle = messageText.length > 30 
        ? messageText.substring(0, 30) + '...' 
        : messageText
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, title: truncatedTitle, messages: newMessages }
          : chat
      ))
    } else {
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: newMessages }
          : chat
      ))
    }
    
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
    setShowHistoryModal(false)
  }
  
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setMessages(chat.messages)
      // Reset animated title when switching chats
      setAnimatedTitle(chat.title)
      setTitleIsAnimating(false)
    }
    setShowHistoryModal(false)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={cn("h-[100dvh] w-full flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-hidden md:h-full", className)} style={{ height: 'calc(100dvh - 100px)' }}>
      {/* Top Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        {/* Chat History Button */}
        <button
          onClick={() => setShowHistoryModal(true)}
          className="p-2 rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer"
          aria-label="Show chat history"
        >
          <Menu className="w-5 h-5 text-gray-600 group-hover:text-stellar-orange transition-colors" />
        </button>

        {/* Current Chat Title */}
        <div className="flex-1 text-center">
          <h2 className="text-sm font-medium text-gray-900 truncate px-4 flex items-center justify-center">
            <span>{animatedTitle}</span>
            {titleIsAnimating && (
              <motion.span
                className="inline-block w-0.5 h-4 bg-gray-900 ml-0.5"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              />
            )}
          </h2>
        </div>

        {/* Placeholder for symmetry */}
        <div className="w-9 h-9" />
      </div>

      {/* Messages Area - Now properly constrained */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-[180px]">
          {messages.length === 0 ? (
            /* Welcome Screen with Centered Virtual Assistant */
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-32 h-32 mb-4 flex items-center justify-center">
                <SiriOrb size="128px" animationDuration={6} isActive={true} />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Hi! I'm Stella
                </h1>
                <p className="text-gray-600 max-w-sm">
                  I help people fight back against insurance companies who lowball, delay, or deny legitimate claims
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {[
                  "My claim was denied",
                  "I'm being lowballed", 
                  "They're delaying my claim",
                  "I need help fighting back"
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-stellar-orange hover:text-stellar-orange transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages View */
            <div className="space-y-4 max-w-2xl mx-auto">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-last' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user' 
                          ? 'bg-stellar-orange text-white' 
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      </div>
                      
                      {message.suggestions && (
                        <div className="mt-2 flex flex-wrap gap-2">
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
                      
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-right text-gray-400' : 'text-left text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%]">
                    <div className="bg-white border border-gray-200 text-gray-800 shadow-sm rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
      </div>

      {/* Input Area - Microsoft Copilot Style */}
      <div className="fixed bottom-0 left-0 right-0 pb-[88px] z-40">
        {/* Gradient overlay for smooth transition from chat to input - positioned above the input */}
        <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-b from-transparent to-white pointer-events-none" />
        
        <div>
        <div className="max-w-2xl mx-auto px-4 py-2">
          {/* Outer container with thick border effect */}
          <div className="bg-gray-200 rounded-3xl p-[2px]">
            {/* Inner container */}
            <div className="bg-white rounded-3xl p-3">
              {/* Text Input Area */}
              <div>
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Message Stella"
                  disabled={isTyping}
                  className="w-full px-3 py-2 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none resize-none transition-all disabled:opacity-50"
                  style={{ 
                    minHeight: '40px',
                    maxHeight: '200px',
                    overflowY: inputValue.split('\n').length > 5 ? 'auto' : 'hidden'
                  }}
                />
              </div>
              
              {/* Bottom Controls */}
              <div className="flex items-center justify-between">
                {/* Model Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <span>{modelOptions.find(m => m.value === selectedModel)?.label}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showModelDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10">
                      {modelOptions.map((model) => (
                        <button
                          key={model.value}
                          onClick={() => {
                            setSelectedModel(model.value)
                            setShowModelDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-sm text-gray-900">{model.label}</div>
                          <div className="text-xs text-gray-500">{model.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Attachment Button */}
                  <button
                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                    aria-label="Attach file"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                  
                  {/* Mic/Send Button */}
                  <button
                    onClick={() => {
                      if (inputValue.trim()) {
                        handleSend()
                      } else {
                        setIsRecording(!isRecording)
                      }
                    }}
                    disabled={isTyping}
                    className={cn(
                      "p-1.5 rounded-full transition-all",
                      inputValue.trim() && !isTyping
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        : isRecording
                        ? "bg-red-500 text-white animate-pulse"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                    aria-label={inputValue.trim() ? "Send message" : "Voice input"}
                  >
                    {inputValue.trim() ? (
                      <ArrowUp className="w-5 h-5" />
                    ) : (
                      <MicrophoneIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>


      {/* Sliding Chat History Panel */}
      <AnimatePresence>
        {showHistoryModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setShowHistoryModal(false)}
            />
            
            {/* Sliding Panel from Left */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-4 left-4 bottom-[100px] w-80 bg-white z-40 rounded-3xl flex flex-col overflow-hidden"
              style={{ boxShadow: '10px 0 40px -10px rgba(0, 0, 0, 0.3), 20px 0 50px -20px rgba(0, 0, 0, 0.2)' }}
            >
              {/* Modal Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* New Chat Button */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <button
                  onClick={createNewChat}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-stellar-orange text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <Plus size={20} />
                  <span className="font-medium">New Chat</span>
                </button>
              </div>

              {/* Chat List - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => selectChat(chat.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${
                        currentChatId === chat.id 
                          ? 'bg-stellar-orange/10 border-2 border-stellar-orange/30' 
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MessageSquare 
                          size={18} 
                          className={`mt-0.5 flex-shrink-0 ${
                            currentChatId === chat.id ? 'text-stellar-orange' : 'text-gray-400'
                          }`} 
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            currentChatId === chat.id ? 'text-stellar-orange' : 'text-gray-900'
                          }`}>
                            {chat.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock size={12} className="text-gray-400 flex-shrink-0" />
                            <p className="text-xs text-gray-500">
                              {formatTimeAgo(chat.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}