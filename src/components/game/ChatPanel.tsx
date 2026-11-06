// ============================================================
// NETIZENCITY - Chat Panel Component (Cozy Simulation Game HUD)
// ============================================================

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, Send, X, ShieldCheck, Loader2 } from 'lucide-react'
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
      sender_name: 'Mayor',
      content: 'Selamat datang di NETIZENCITY! Jelajahi kota, kunjungi Alun-Alun Tugu, dan jadilah warga aktif.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'init-2',
      sender_name: 'Admin Kota',
      content: 'Klaim hadiah harian di Balai Kota, kunjungi Alun-Alun Tugu, dan belanja outfit di Netizen Mall!',
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
    fetchMessages()
    const interval = setInterval(fetchMessages, 6000)
    return () => clearInterval(interval)
  }, [fetchMessages])

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

    const senderName = profile?.displayName || profile?.username || 'Pengunjung'
    const tempMsg: ChatMsg = {
      id: `local-${Date.now()}`,
      citizen_id: profile?.id || 'local-me',
      sender_name: senderName,
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('player-chat-sent', {
          detail: { text, sender: senderName },
        })
      )
    }

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
        className="bg-[#F7F4E9] hover:bg-[#EFE9D8] text-[#343B35] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-[#D8CEBE] shadow-md flex items-center gap-2 transition-colors cursor-pointer pointer-events-auto select-auto"
      >
        <div className="w-5 h-5 rounded-md bg-[#668B65]/15 text-[#668B65] flex items-center justify-center">
          <MessageSquare className="w-3 h-3" />
        </div>
        <span className="text-xs font-semibold text-[#343B35]">
          Obrolan Warga
        </span>
        <span className="w-2 h-2 rounded-full bg-[#668B65]" />
      </button>
    )
  }

  return (
    <div className="w-[calc(100vw-24px)] max-w-sm h-72 sm:h-80 bg-[#F7F4E9] border border-[#D8CEBE] rounded-2xl shadow-xl flex flex-col overflow-hidden pointer-events-auto select-auto">
      {/* Header */}
      <div className="px-3 py-2 bg-[#EFE9D8] border-b border-[#D8CEBE] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#668B65] text-white flex items-center justify-center">
            <MessageSquare className="w-3 h-3" />
          </div>
          <span className="font-semibold text-xs text-[#343B35]">
            Obrolan Kota
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#668B65]/15 text-[#668B65] font-medium">
            Live
          </span>
        </div>
        <button
          type="button"
          onClick={toggleChat}
          className="w-6 h-6 rounded-md bg-[#F7F4E9] hover:bg-[#EFE9D8] text-[#78634B] flex items-center justify-center border border-[#D8CEBE] transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message history */}
      <div className="flex-1 p-2.5 overflow-y-auto space-y-2 text-xs">
        {messages.map((m) => {
          const isSystem =
            m.sender_name === 'Mayor' ||
            m.sender_name === 'Pak Mayor' ||
            m.sender_name === 'Admin Kota' ||
            m.sender_name === 'Pemerintah Kota'

          const cleanSender = m.sender_name.replace(/\s*\(Kamu\)$/i, '').trim()

          const isMe =
            !isSystem &&
            ((profile?.id && m.citizen_id === profile.id) ||
              m.citizen_id === 'local-me' ||
              (Boolean(profile?.username) &&
                cleanSender.toLowerCase() === profile!.username.toLowerCase()))

          const displaySender = isMe ? `${cleanSender} (Kamu)` : cleanSender

          const timeStr = m.created_at
            ? new Date(m.created_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '12:00'

          return (
            <div
              key={m.id}
              className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                isSystem
                  ? 'bg-[#EFE9D8] border-[#D8CEBE] text-[#343B35]'
                  : isMe
                  ? 'bg-[#668B65]/10 border-[#668B65]/30 text-[#343B35] ml-3'
                  : 'bg-white/90 border-[#D8CEBE] text-[#343B35] mr-3'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    isSystem
                      ? 'text-[#78634B]'
                      : isMe
                      ? 'text-[#668B65]'
                      : 'text-[#78634B]'
                  }`}
                >
                  {isSystem && <ShieldCheck className="w-3 h-3 text-[#78634B]" />}
                  {displaySender}
                </span>
                <span className="text-[10px] text-[#78634B]/70">{timeStr}</span>
              </div>
              <p className="text-xs break-words">{m.content}</p>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-2 bg-[#EFE9D8] border-t border-[#D8CEBE] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 bg-[#F7F4E9] border border-[#D8CEBE] rounded-lg px-2.5 py-1.5 text-xs text-[#343B35] placeholder-[#78634B]/60 focus:outline-none focus:border-[#668B65]"
          maxLength={150}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="px-3 py-1.5 rounded-lg bg-[#668B65] hover:bg-[#527251] text-white border border-[#527251] disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer"
        >
          {isSending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
    </div>
  )
}
