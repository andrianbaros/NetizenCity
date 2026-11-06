// ============================================================
// NETIZENCITY - Badge Component (Playful Pill Chips)
// ============================================================

import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'gold' | 'lavender'
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
    primary: 'bg-[#EAF3FD] text-[#245282] border-[#BFD8F6]',
    success: 'bg-[#EBF8F3] text-[#1E5D46] border-[#B7E7D5]',
    warning: 'bg-[#FFF9E6] text-[#785E0E] border-[#FCE69C]',
    danger: 'bg-[#FDEEF1] text-[#9A2D45] border-[#F9CAD3]',
    lavender: 'bg-[#F5F0FD] text-[#55387E] border-[#DACBF6]',
    neutral: 'bg-[#F5EDE1] text-[#524658] border-[#E3D4C2]',
    gold: 'bg-gradient-to-r from-[#FFF5D0] to-[#FFE896] text-[#6A4D07] border-[#ECC956] font-bold shadow-xs',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
  }

  return (
    <span
      className={`inline-flex items-center font-heading font-bold rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
