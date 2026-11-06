// ============================================================
// NETIZENCITY - Button Component (Cozy 3D Game Aesthetic)
// ============================================================

import React, { forwardRef } from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'mint'
    | 'peach'
    | 'lavender'
    | 'danger'
    | 'ghost'
    | 'pixel'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-heading font-bold transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-0.5 cursor-pointer'

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5 border-b-2',
      md: 'px-4.5 py-2 text-sm rounded-2xl gap-2 border-b-3',
      lg: 'px-6 py-2.5 text-base rounded-2xl gap-2.5 border-b-4',
    }

    const variantStyles = {
      primary:
        'bg-gradient-to-b from-[#BEDBF4] to-[#A9C8EC] text-[#20456E] border-2 border-[#86A8D2] border-b-[#668CB7] shadow-sm hover:from-[#CCE4F8] hover:to-[#B6D2F4]',
      secondary:
        'bg-gradient-to-b from-[#FFFDF9] to-[#F5ECE0] text-[#3B3340] border-2 border-[#E2D2C2] border-b-[#CCA892] shadow-sm hover:bg-[#FFFDF9]',
      accent:
        'bg-gradient-to-b from-[#FFE896] to-[#F7D772] text-[#4A3A12] border-2 border-[#D9AF3A] border-b-[#B88E1C] shadow-sm hover:from-[#FFF0AD] hover:to-[#F8DE82]',
      mint:
        'bg-gradient-to-b from-[#C2EADE] to-[#A8DCC8] text-[#1B5745] border-2 border-[#86C4AD] border-b-[#60A28A] shadow-sm hover:from-[#D0F0E6] hover:to-[#B7E5D4]',
      peach:
        'bg-gradient-to-b from-[#F8BCA4] to-[#F4A98C] text-white border-2 border-[#D98868] border-b-[#B86241] shadow-sm hover:from-[#FAC7B3] hover:to-[#F6B49A]',
      lavender:
        'bg-gradient-to-b from-[#DFD2F7] to-[#C9B8E8] text-[#463167] border-2 border-[#A793CC] border-b-[#816AA8] shadow-sm hover:from-[#E9DFFC] hover:to-[#D4C5EE]',
      danger:
        'bg-gradient-to-b from-[#F7A6B5] to-[#F08096] text-white border-2 border-[#D9617A] border-b-[#B6435C] shadow-sm hover:from-[#F9B7C3] hover:to-[#F28C9F]',
      ghost:
        'bg-white/40 hover:bg-white/80 text-[#3B3340] border border-[#E8DCCF] border-b-2 border-b-[#D8C7B8]',
      pixel:
        'bg-[#A9C8EC] text-[#20456E] border-2 border-b-4 border-r-4 border-[#3B3340] active:border-b-2 active:border-r-2 uppercase tracking-wider',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
