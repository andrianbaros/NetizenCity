// ============================================================
// NETIZENCITY - Modal Component (Cozy Diorama Popup)
// ============================================================

'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const widthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto select-auto"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Warm Backdrop with soft blur */}
      <div
        className="fixed inset-0 bg-[#2C2430]/60 backdrop-blur-sm transition-opacity cursor-pointer animate-fade-in"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full ${widthStyles[maxWidth]} bg-[#FFFDF9] text-[#3B3340] border-2 border-[#EADBCC] rounded-3xl shadow-[0_20px_60px_-15px_rgba(70,50,60,0.3)] overflow-hidden flex flex-col max-h-[90vh] transition-all transform duration-150`}
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Warm cream with signature pastel badge & tactile close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#F0E4D5] bg-gradient-to-r from-[#FFF9F1] to-[#FFF3E3]">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F4A98C]" />
            <h3 className="font-heading text-lg font-bold text-[#3B3340] tracking-tight">
              {title || 'NETIZENCITY'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#D97858] hover:bg-[#F4A98C] hover:text-white transition-colors flex items-center justify-center cursor-pointer border border-[#F2C9B6] shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto pointer-events-auto leading-relaxed">{children}</div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
