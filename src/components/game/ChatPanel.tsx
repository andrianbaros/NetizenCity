// ============================================================
// NETIZENCITY - Chat Panel Component (Cozy Diorama Speech Bubbles)
// ============================================================

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, Send, X, Users, Loader2, ShieldCheck } from 'lucide-react'
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

    const senderName = profile?.username || profile?.displayName || 'Warga'
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
        className="bg-[#FFFDF9]/95 hover:bg-[#FFF8ED] text-[#3B3340] px-5 py-3 rounded-2xl border-2 border-[#EADBCC] border-b-4 border-b-[#D6C2AC] active:border-b-2 active:translate-y-0.5 shadow-lg backdrop-blur-md flex items-center space-x-2.5 transition-transform cursor-pointer pointer-events-auto select-auto font-sans"
      >
        <div className="w-7 h-7 rounded-xl bg-[#FFF2EB] border border-[#F4C8B4] flex items-center justify-center text-[#D97858]">
          <MessageSquare className="w-4 h-4" />
        </div>
        <span className="text-xs font-heading font-extrabold text-[#3B3340]">
          Obrolan Warga
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#2F9474] animate-pulse" />
      </button>
    )
  }

  return (
    <div className="w-80 sm:w-96 h-88 bg-[#FFFDF9]/98 border-2 border-[#EADBCC] rounded-3xl shadow-[0_20px_50px_rgba(70,50,60,0.25)] backdrop-blur-md flex flex-col overflow-hidden pointer-events-auto select-auto font-sans animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#FFF9F1] to-[#FFF3E3] border-b-2 border-[#F0E4D5] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#FFF2EB] border border-[#F4C8B4] flex items-center justify-center text-[#D97858]">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="font-heading font-bold text-sm text-[#3B3340] tracking-tight">
            Obrolan Kota
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF8F3] text-[#1E5D46] border border-[#B7E7D5] font-heading font-bold">
            Live
          </span>
        </div>
        <button
          type="button"
          onClick={toggleChat}
          className="w-7 h-7 rounded-full bg-[#FFF0E6] text-[#D97858] hover:bg-[#F4A98C] hover:text-white transition-colors flex items-center justify-center cursor-pointer border border-[#F2C9B6]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message history */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
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
              className={`p-3 rounded-2xl border-2 transition-all ${
                isSystem
                  ? 'bg-[#F5F0FD] border-[#DACBF6] text-[#463167]'
                  : isMe
                  ? 'bg-[#EBF8F3] border-[#B7E7D5] text-[#1E5D46] ml-4'
                  : 'bg-[#FFF9F1] border-[#F0E4D5] text-[#3B3340] mr-4'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span
                  className={`font-heading font-bold flex items-center gap-1 ${
                    isSystem
                      ? 'text-[#55387E]'
                      : isMe
                      ? 'text-[#1B5745]'
                      : 'text-[#8A6814]'
                  }`}
                >
                  {isSystem && <ShieldCheck className="w-3 h-3 text-[#8F7AB4]" />}
                  {displaySender}
                </span>
                <span className="text-[10px] text-[#9A8F98]">{timeStr}</span>
              </div>
              <p className="leading-relaxed text-xs break-words font-medium">{m.content}</p>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-[#FFFDF9] border-t-2 border-[#F0E4D5] flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ketik pesan untuk warga kota..."
          className="flex-1 bg-[#FFF9F1] border-2 border-[#EADBCC] rounded-2xl px-3.5 py-2 text-xs text-[#3B3340] placeholder-[#A499A8] focus:outline-none focus:border-[#F4A98C] transition-colors"
          maxLength={150}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="p-2.5 rounded-2xl bg-gradient-to-b from-[#F8BCA4] to-[#F4A98C] hover:from-[#FAC7B3] hover:to-[#F6B49A] text-white border-2 border-[#D98868] border-b-3 border-b-[#B86241] disabled:opacity-50 transition-all active:translate-y-0.5 cursor-pointer shadow-xs"
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
