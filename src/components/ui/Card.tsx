// ============================================================
// NETIZENCITY - Card Component (Cozy Diorama Panel)
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
    default:
      'bg-[#FFFDF9] border-2 border-[#EADBCC] text-[#3B3340] shadow-[0_8px_24px_rgba(70,50,60,0.08)]',
    surface:
      'bg-[#FFF8ED] border-2 border-[#EEDFCD] text-[#3B3340]',
    glass:
      'bg-[#FFFDF9]/90 backdrop-blur-md border-2 border-[#EADBCC]/90 text-[#3B3340] shadow-lg',
    pixel:
      'bg-[#FFFDF9] border-2 border-b-4 border-r-4 border-[#3B3340] text-[#3B3340]',
  }

  const hoverStyles = hoverEffect
    ? 'transition-all duration-200 hover:-translate-y-1 hover:border-[#F4A98C] hover:shadow-xl'
    : ''

  return (
    <div
      className={`rounded-2xl p-5 ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
