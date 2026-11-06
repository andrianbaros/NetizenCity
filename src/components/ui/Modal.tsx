// ============================================================
// NETIZENCITY - Modal Component (Cozy Simulation Game Dialog)
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pointer-events-auto select-auto"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-[#343B35]/50 transition-opacity cursor-pointer animate-fade-in"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full ${widthStyles[maxWidth]} bg-[#F7F4E9] text-[#343B35] border border-[#D8CEBE] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-all`}
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Warm cream solid with clean accent indicator */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#D8CEBE] bg-[#EFE9D8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#668B65]" />
            <h3 className="font-heading text-sm sm:text-base font-bold text-[#343B35] tracking-tight">
              {title || 'NETIZENCITY'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#F7F4E9] hover:bg-[#E2DACB] text-[#78634B] transition-colors flex items-center justify-center cursor-pointer border border-[#D8CEBE]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto pointer-events-auto leading-relaxed">{children}</div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
