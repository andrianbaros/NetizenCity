// ============================================================
// NETIZENCITY - Badge Component
// ============================================================

import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'gold'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    neutral: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
    gold: 'bg-amber-400/20 text-amber-200 border-amber-400/40 font-semibold',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
