// ============================================================
// NETIZENCITY - Input Component (Warm Rounded Input)
// ============================================================

import React, { forwardRef, useId } from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || props.name || generatedId

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-heading font-bold text-[#5A4F5E] mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#8A7D8F] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[#FFFDF9] text-[#3B3340] placeholder-[#A499A8] border-2 rounded-2xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-3 focus:ring-[#F4A98C]/30 shadow-xs ${
              leftIcon ? 'pl-11' : ''
            } ${rightIcon ? 'pr-11' : ''} ${
              error
                ? 'border-[#F08096] focus:border-[#F08096] text-[#A6263E]'
                : 'border-[#EADBCC] hover:border-[#D5C2B0] focus:border-[#F4A98C]'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#8A7D8F] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-[#C43852] font-semibold">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-[#7A6E7E]">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
