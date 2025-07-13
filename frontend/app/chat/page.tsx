'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from '@/lib/motion'
import { FiSend, FiMessageCircle, FiBook, FiHelpCircle } from '@/lib/icons'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Assalamu Alaikum! I am your Islamic AI assistant. I can help you with questions about Islam, Quran, Hadith, Fiqh, and more. How may I assist you today?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const suggestedQuestions = [
    'What are the Five Pillars of Islam?',
    'How do I perform Wudu correctly?',
    'What is the significance of Ramadan?',
    'Can you explain the story of Prophet Muhammad (PBUH)?',
  ]
  
  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    
    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I understand your question. While I am currently in demo mode, in the full version, I would provide detailed, authentic Islamic guidance based on Quran, Hadith, and scholarly consensus. Please consult with knowledgeable scholars for important religious matters.',
        sender: 'assistant',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 2000)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">Islamic AI Assistant</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Get instant answers to your Islamic questions
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card h-[600px] flex flex-col"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-islamic-500 text-white' 
                    : 'bg-glass-light'
                } px-4 py-3 rounded-2xl`}>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-glass-light px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-400 mb-3">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => setInput(question)}
                    className="px-3 py-1 rounded-full bg-glass-light hover:bg-glass-medium transition-colors text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t border-glass-border p-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your question..."
                className="flex-1 px-4 py-3 rounded-xl bg-glass-light border border-glass-border focus:border-islamic-400 focus:outline-none transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-6 py-3 rounded-xl bg-islamic-500 hover:bg-islamic-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 text-white font-semibold"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          <div className="glass-card p-4 text-center">
            <FiBook className="w-8 h-8 text-islamic-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">Quran & Hadith Based</p>
          </div>
          <div className="glass-card p-4 text-center">
            <FiMessageCircle className="w-8 h-8 text-gold-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">24/7 Available</p>
          </div>
          <div className="glass-card p-4 text-center">
            <FiHelpCircle className="w-8 h-8 text-islamic-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">Scholarly Verified</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}