// ============================================================
// NETIZENCITY - Card Component
// ============================================================

import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'glass' | 'pixel'
  hoverEffect?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-900/90 border border-slate-800 text-slate-100 shadow-xl',
    surface: 'bg-slate-800/80 border border-slate-700/60 text-slate-100',
    glass: 'bg-slate-900/70 backdrop-blur-md border border-slate-700/40 text-slate-100',
    pixel:
      'bg-slate-900 border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] text-slate-100',
  }

  const hoverStyles = hoverEffect
    ? 'transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl'
    : ''

  return (
    <div
      className={`rounded-xl p-5 ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
