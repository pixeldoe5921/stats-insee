'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { 
  MessageSquareIcon, 
  SendIcon, 
  BotIcon, 
  UserIcon,
  MinimizeIcon,
  MaximizeIcon,
  LoaderIcon
} from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  suggestions?: string[]
  insights?: string[]
}

interface ChatBotProps {
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

export function ChatBot({ isMinimized = false, onToggleMinimize }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis votre assistant IA pour l\'analyse des données économiques. Vous pouvez me poser des questions sur le PIB, le chômage, l\'inflation, ou tout autre indicateur économique français et européen.',
      role: 'assistant',
      timestamp: new Date(),
      suggestions: [
        'Quelle est l\'évolution du PIB français cette année ?',
        'Comment le taux de chômage a-t-il évolué ?',
        'Quels sont les derniers chiffres de l\'inflation ?',
        'Compare les performances économiques France vs UE'
      ]
    }
  ])
  
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: content,
          conversation: messages
        })
      })

      if (!response.ok) {
        throw new Error('Erreur réseau')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
        role: 'assistant',
        timestamp: new Date(),
        suggestions: data.suggestedQueries,
        insights: data.dataInsights
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Erreur chat:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Désolé, je rencontre un problème technique. Pourriez-vous réessayer ?',
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const clearConversation = () => {
    setMessages([messages[0]]) // Garder le message de bienvenue
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          className="rounded-full w-14 h-14 shadow-lg"
          variant="default"
        >
          <MessageSquareIcon className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] flex flex-col">
      <Card className="flex-1 flex flex-col p-0 shadow-xl border-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <BotIcon className="h-5 w-5" />
            <span className="font-semibold">Assistant IA Économique</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-white hover:bg-blue-700 h-8 w-8 p-0"
            >
              🔄
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="text-white hover:bg-blue-700 h-8 w-8 p-0"
            >
              <MinimizeIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <BotIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border shadow-sm'
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Insights */}
                {message.insights && message.insights.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-600 mb-1">💡 Points clés :</div>
                    <ul className="text-xs space-y-1">
                      {message.insights.map((insight, index) => (
                        <li key={index} className="text-gray-600">• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs font-medium text-gray-600 mb-1">Questions suggérées :</div>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 transition-colors"
                        disabled={isLoading}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <LoaderIcon className="h-4 w-4 text-white animate-spin" />
                </div>
              </div>
              <div className="bg-white border shadow-sm rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question sur l'économie..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              size="sm"
              className="px-3"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}