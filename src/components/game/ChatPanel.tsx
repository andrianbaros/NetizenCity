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

const CHAT_RETENTION_MS = 30 * 60 * 1000 // 30 minutes retention

export default function ChatPanel() {
  const isChatOpen = useUIStore((s) => s.isChatOpen)
  const toggleChat = useUIStore((s) => s.toggleChat)
  const profile = useCitizenStore((s) => s.profile)

  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'init-1',
      sender_name: 'Mayor',
      content: 'Selamat datang di NETIZENCITY! Obrolan kota aktif dan terhapus otomatis setiap 30 menit.',
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
      const res = await fetch(`/api/chat?_t=${Date.now()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.messages && Array.isArray(data.messages)) {
          const now = Date.now()
          // Filter messages strictly within 30 minutes
          const fresh = data.messages.filter((m: ChatMsg) => {
            const t = new Date(m.created_at).getTime()
            return !isNaN(t) && now - t <= CHAT_RETENTION_MS
          })

          setMessages((prev) => {
            // Retain recent local pending messages that haven't expired and aren't in fresh yet
            const localPending = prev.filter(
              (p) => p.id.startsWith('local-') && now - new Date(p.created_at).getTime() < 12000
            )
            const merged = [...fresh]
            for (const lp of localPending) {
              if (
                !merged.some(
                  (m) =>
                    m.content === lp.content &&
                    m.sender_name === lp.sender_name &&
                    Math.abs(new Date(m.created_at).getTime() - new Date(lp.created_at).getTime()) < 5000
                )
              ) {
                merged.push(lp)
              }
            }
            return merged
          })
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3500)
    return () => clearInterval(interval)
  }, [fetchMessages])

  // Periodic purge timer on client side (every 15 seconds) to remove messages older than 30 minutes
  useEffect(() => {
    const pruneTimer = setInterval(() => {
      const now = Date.now()
      setMessages((prev) =>
        prev.filter((m) => {
          const t = new Date(m.created_at).getTime()
          return !isNaN(t) && now - t <= CHAT_RETENTION_MS
        })
      )
    }, 15000)
    return () => clearInterval(pruneTimer)
  }, [])

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
    const citizenId = profile?.id || 'local-me'
    const tempMsg: ChatMsg = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      citizen_id: citizenId,
      sender_name: senderName,
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    // Trigger 3D speech bubble above avatar
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
        body: JSON.stringify({
          content: text,
          senderName,
          citizenId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempMsg.id ? data.message : m))
          )
        }
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
        className="bg-[#F7F4E9] hover:bg-[#EFE9D8] text-[#343B35] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[#D8CEBE] shadow-md flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer pointer-events-auto select-auto"
        title="Buka Obrolan Warga"
      >
        <div className="w-5 h-5 rounded-md bg-[#668B65]/15 text-[#668B65] flex items-center justify-center shrink-0">
          <MessageSquare className="w-3 h-3" />
        </div>
        <span className="text-xs font-semibold text-[#343B35]">
          <span className="sm:hidden">Obrolan</span>
          <span className="hidden sm:inline">Obrolan Warga</span>
        </span>
        <span className="w-2 h-2 rounded-full bg-[#668B65] shrink-0 animate-pulse" />
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
          <span
            className="text-[10px] px-1.5 py-0.2 rounded bg-[#668B65]/15 text-[#668B65] font-semibold"
            title="Pesan otomatis diperbarui dan terhapus setelah 30 menit"
          >
            Live • 30m
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
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#78634B]">
            <div className="w-8 h-8 rounded-full bg-[#668B65]/15 text-[#668B65] flex items-center justify-center mb-1.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="font-heading font-bold text-xs text-[#343B35]">Obrolan Masih Kosong</p>
            <p className="text-[11px] text-[#78634B] mt-0.5 leading-snug">
              Pesan obrolan aktif dan otomatis terhapus setelah 30 menit. Ketik pesan untuk menyapa warga!
            </p>
          </div>
        ) : (
          messages.map((m) => {
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
          })
        )}
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
          className="flex-1 bg-[#F7F4E9] border border-[#D8CEBE] rounded-lg px-2.5 py-1.5 text-sm sm:text-xs text-[#343B35] placeholder-[#78634B]/60 focus:outline-none focus:border-[#668B65]"
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
