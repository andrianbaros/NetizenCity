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

const CHAT_RETENTION_MS = 30 * 60 * 1000 // 30 minutes retention per individual message
const CHAT_STORAGE_KEY = 'nc_city_chat_history'

function mergeChatMessages(existingList: ChatMsg[], incomingList: ChatMsg[]): ChatMsg[] {
  const now = Date.now()
  const cutoff = now - CHAT_RETENTION_MS

  // 1. Keep only unexpired messages (< 30 minutes old) from existing list
  const validExisting = existingList.filter((m) => {
    const t = new Date(m.created_at).getTime()
    return !isNaN(t) && t >= cutoff
  })

  // 2. Keep only unexpired messages (< 30 minutes old) from incoming list
  const validIncoming = incomingList.filter((m) => {
    const t = new Date(m.created_at).getTime()
    return !isNaN(t) && t >= cutoff
  })

  const map = new Map<string, ChatMsg>()

  // Retain all existing valid messages
  for (const m of validExisting) {
    map.set(m.id, m)
  }

  // Merge incoming messages, seamlessly replacing matching optimistic local messages
  for (const inc of validIncoming) {
    for (const [key, ex] of map.entries()) {
      if (
        key.startsWith('local-') &&
        ex.content === inc.content &&
        ex.sender_name === inc.sender_name &&
        Math.abs(new Date(ex.created_at).getTime() - new Date(inc.created_at).getTime()) < 15000
      ) {
        map.delete(key)
      }
    }
    map.set(inc.id, inc)
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

export default function ChatPanel() {
  const isChatOpen = useUIStore((s) => s.isChatOpen)
  const toggleChat = useUIStore((s) => s.toggleChat)
  const profile = useCitizenStore((s) => s.profile)

  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'init-1',
      sender_name: 'Pak Mayor',
      content: 'Selamat datang di NETIZENCITY! Obrolan kota aktif. Setiap pesan tersimpan selama 30 menit agar database tetap bersih.',
      created_at: new Date().toISOString(),
    },
  ])
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load cached chats on mount
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CHAT_STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages((prev) => mergeChatMessages(prev, parsed))
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist valid chats to session storage
  useEffect(() => {
    try {
      const now = Date.now()
      const cutoff = now - CHAT_RETENTION_MS
      const valid = messages.filter((m) => {
        const t = new Date(m.created_at).getTime()
        return !isNaN(t) && t >= cutoff
      })
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(valid))
    } catch {
      // ignore
    }
  }, [messages])

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?_t=${Date.now()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.messages && Array.isArray(data.messages)) {
          setMessages((prev) => mergeChatMessages(prev, data.messages))
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

  // Periodic purge timer on client side (every 10 seconds)
  // Prunes ONLY individual messages that have exceeded 30 minutes since creation
  useEffect(() => {
    const pruneTimer = setInterval(() => {
      const now = Date.now()
      const cutoff = now - CHAT_RETENTION_MS
      setMessages((prev) =>
        prev.filter((m) => {
          const t = new Date(m.created_at).getTime()
          return !isNaN(t) && t >= cutoff
        })
      )
    }, 10000)
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
    setMessages((prev) => mergeChatMessages(prev, [tempMsg]))

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
          setMessages((prev) => mergeChatMessages(prev, [data.message]))
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
            title="Setiap pesan otomatis dihapus dari database setelah berumur 30 menit"
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
              Obrolan warga aktif. Setiap pesan yang berumur 30 menit otomatis dihapus dari database. Ketik pesan untuk menyapa warga!
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
