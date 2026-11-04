// ============================================================
// NETIZENCITY - Chat Panel Component (Real-Time Local DB Sync)
// Connects to /api/chat with auto-refresh & posting
// ============================================================

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, Send, X, Users, Loader2 } from 'lucide-react'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

interface ChatMsg {
  id: string
  sender_name: string
  content: string
  created_at: string
  citizen_id?: string
}

export default function ChatPanel() {
  const isChatOpen = useUIStore((s) => s.isChatOpen)
  const toggleChat = useUIStore((s) => s.toggleChat)
  const profile = useCitizenStore((s) => s.profile)

  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'init-1',
      sender_name: 'Pemerintah Kota',
      content: 'Selamat datang di NETIZENCITY! Gunakan WASD / panah untuk berjalan.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'init-2',
      sender_name: 'Admin Kota',
      content: 'Jangan lupa klaim hadiah harian di balai kota dan ambil misi harian!',
      created_at: new Date().toISOString(),
    },
  ])
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/chat')
      if (res.ok) {
        const data = await res.json()
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (isChatOpen) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [isChatOpen, fetchMessages])

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom()
    }
  }, [messages, isChatOpen])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isSending) return

    const text = inputMessage.trim()
    setInputMessage('')
    setIsSending(true)

    // Optimistic local update
    const myName = profile?.username ? `${profile.username} (Kamu)` : 'Kamu'
    const tempMsg: ChatMsg = {
      id: 'temp-' + Date.now(),
      sender_name: myName,
      citizen_id: profile?.id,
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })

      if (res.ok) {
        fetchMessages()
      }
    } catch {
      // optimistic message remains
    } finally {
      setIsSending(false)
    }
  }

  if (!isChatOpen) {
    return (
      <button
        type="button"
        onClick={toggleChat}
        className="bg-slate-900/95 hover:bg-slate-800 text-white p-3 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer pointer-events-auto select-auto"
      >
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <span className="text-xs font-semibold hidden sm:inline">Obrolan Warga</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>
    )
  }

  return (
    <div className="w-80 sm:w-96 h-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden pointer-events-auto select-auto">
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            Obrolan Kota (Global)
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            Live
          </span>
        </div>
        <button
          type="button"
          onClick={toggleChat}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message history */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2 text-xs">
        {messages.map((m) => {
          const isSystem =
            m.sender_name === 'Pemerintah Kota' || m.sender_name === 'Admin Kota'
          const isMe =
            m.citizen_id === profile?.id ||
            m.sender_name.endsWith('(Kamu)') ||
            (profile?.username &&
              m.sender_name.toLowerCase().includes(profile.username.toLowerCase()))

          const displaySender = isMe
            ? `${profile?.username || 'warga'} (Kamu)`
            : m.sender_name

          const timeStr = m.created_at
            ? new Date(m.created_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '12:00'

          return (
            <div
              key={m.id}
              className={`p-2.5 rounded-xl border transition-all ${
                isSystem
                  ? 'bg-blue-950/40 border-blue-500/30 text-blue-200'
                  : isMe
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-100'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span
                  className={`font-bold ${
                    isSystem
                      ? 'text-blue-300'
                      : isMe
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {displaySender}
                </span>
                <span className="font-mono text-slate-500">{timeStr}</span>
              </div>
              <p className="leading-relaxed text-xs break-words">{m.content}</p>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ketik pesan untuk warga kota..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          maxLength={150}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors cursor-pointer"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  )
}
