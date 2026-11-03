'use client'

import React, { useState } from 'react'
import { MessageSquare, Send, X, Smile } from 'lucide-react'
import { useUIStore } from '@/lib/stores/useUIStore'

interface ChatMsg {
  id: string
  sender: string
  text: string
  time: string
  isSystem?: boolean
}

export default function ChatPanel() {
  const isChatOpen = useUIStore((s) => s.isChatOpen)
  const toggleChat = useUIStore((s) => s.toggleChat)

  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: '1',
      sender: 'Sistem Kota',
      text: 'Selamat datang di NETIZENCITY! Gunakan tombol WASD atau panah untuk berjalan.',
      time: '12:00',
      isSystem: true,
    },
    {
      id: '2',
      sender: 'AdminNetizen',
      text: 'Halo semua warga baru, jangan lupa klaim bonus harian di balai kota!',
      time: '12:01',
    },
  ])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`

    const newMsg: ChatMsg = {
      id: Math.random().toString(),
      sender: 'Kamu (Warga)',
      text: inputMessage.trim(),
      time: timeStr,
    }

    setMessages((prev) => [...prev, newMsg])
    setInputMessage('')
  }

  if (!isChatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="bg-slate-900/90 hover:bg-slate-800 text-white p-3 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center space-x-2 transition-transform active:scale-95"
      >
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <span className="text-xs font-semibold hidden sm:inline">Obrolan Warga</span>
      </button>
    )
  }

  return (
    <div className="w-80 sm:w-96 h-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            Obrolan Kota (Global)
          </span>
        </div>
        <button
          onClick={toggleChat}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message history */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded-lg ${
              m.isSystem
                ? 'bg-blue-950/40 border border-blue-500/20 text-blue-300'
                : 'bg-slate-800/60 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
              <span className="font-bold text-slate-300">{m.sender}</span>
              <span>{m.time}</span>
            </div>
            <p className="leading-relaxed break-words">{m.text}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-2 bg-slate-950/90 border-t border-slate-800 flex items-center space-x-1.5"
      >
        <input
          type="text"
          placeholder="Ketik pesan untuk warga kota..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
