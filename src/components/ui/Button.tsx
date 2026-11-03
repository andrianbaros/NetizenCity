// ============================================================
// NETIZENCITY - Button Component
// ============================================================

import React, { forwardRef } from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'pixel'
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
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]'

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
      md: 'px-4 py-2 text-sm rounded-lg gap-2',
      lg: 'px-6 py-3 text-base rounded-xl gap-2.5 font-semibold',
    }

    const variantStyles = {
      primary:
        'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 border border-blue-400/30 focus:ring-blue-400',
      secondary:
        'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-400',
      accent:
        'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-900/30 focus:ring-amber-400',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30 focus:ring-rose-400',
      ghost:
        'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-500',
      pixel:
        'bg-blue-600 hover:bg-blue-500 text-white border-2 border-b-4 border-r-4 border-slate-950 active:border-b-2 active:border-r-2 uppercase tracking-wider font-mono',
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
