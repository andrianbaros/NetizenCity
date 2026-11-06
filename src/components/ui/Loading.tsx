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
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-[#EADBCC] border-t-[#F4A98C] rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-black tracking-wider text-[#F4A98C]">
          NC
        </div>
      </div>
      <h2 className="text-xl font-extrabold text-[#3B3340] tracking-widest uppercase mb-2">
        NETIZENCITY
      </h2>
      <p className="text-sm text-[#6F6675] font-semibold">{message}</p>
    </div>
  )
}
