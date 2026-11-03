// ============================================================
// NETIZENCITY - Loading Spinner & Skeleton
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
      className={`animate-spin rounded-full border-blue-500 border-t-transparent ${sizeMap[size]} ${className}`}
    />
  )
}

export const LoadingScreen: React.FC<{ message?: string }> = ({
  message = 'Memuat NETIZENCITY...',
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-blue-400">
          NC
        </div>
      </div>
      <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-2">
        NETIZENCITY
      </h2>
      <p className="text-sm text-slate-400 font-medium">{message}</p>
    </div>
  )
}
