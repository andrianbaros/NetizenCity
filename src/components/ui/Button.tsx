// ============================================================
// NETIZENCITY - Button Component (Cozy Simulation Game Buttons)
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
      'inline-flex items-center justify-center font-heading font-semibold transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-0.5 cursor-pointer rounded-xl'

    const sizeStyles = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-3.5 py-2 text-xs sm:text-sm gap-2',
      lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5',
    }

    const variantStyles = {
      primary:
        'bg-[#668B65] text-white hover:bg-[#557754] border border-[#557754] shadow-xs',
      secondary:
        'bg-[#EFE9D8] text-[#343B35] hover:bg-[#E2DACB] border border-[#D8CEBE] shadow-xs',
      accent:
        'bg-[#E6C66F] text-[#343B35] hover:bg-[#DBB858] border border-[#CCA745] shadow-xs',
      mint:
        'bg-[#A5BE91] text-[#253224] hover:bg-[#93AE7F] border border-[#839F6F] shadow-xs',
      peach:
        'bg-[#78634B] text-white hover:bg-[#64513B] border border-[#584632] shadow-xs',
      lavender:
        'bg-[#A9C9D8] text-[#1E3947] hover:bg-[#95BDCE] border border-[#82ACC0] shadow-xs',
      danger:
        'bg-[#C25E5E] text-white hover:bg-[#AD4D4D] border border-[#993E3E] shadow-xs',
      ghost:
        'bg-transparent hover:bg-[#EFE9D8] text-[#343B35]',
      pixel:
        'bg-[#668B65] text-white border-2 border-[#343B35] active:translate-y-0.5 uppercase tracking-wider',
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
            className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current"
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
