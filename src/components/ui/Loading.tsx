// ============================================================
// NETIZENCITY - Loading Spinner & Screen
// Stylized for Cozy Pastel Diorama Aesthetic
// ============================================================

import React from 'react'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div
      className={`animate-spin rounded-full border-[#EADBCC] border-t-[#F4A98C] ${sizeMap[size]} ${className}`}
    />
  )
}

export const LoadingScreen: React.FC<{ message?: string }> = ({
  message = 'Memuat NETIZENCITY...',
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#F8F4EE] flex flex-col items-center justify-center p-4">
      <div className="relative w-32 sm:w-40 h-auto mb-3 animate-pulse drop-shadow-xl">
        <img
          src="/brand/logo-badge.webp"
          alt="Netizen City Logo"
          className="w-full h-auto object-contain"
        />
      </div>
      <div className="w-44 mb-3">
        <img
          src="/brand/logo-text.png"
          alt="NETIZEN CITY"
          className="w-full h-auto object-contain mx-auto"
        />
      </div>
      <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#78634B] bg-[#EFE9D8] px-3.5 py-1.5 rounded-full border border-[#D8CEBE] shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[#668B65] animate-ping" />
        <span>{message}</span>
      </div>
    </div>
  )
}
