'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? ` - ${this.props.name}` : ''}]`, error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-sans">
          <p className="font-bold">Komponen {this.props.name || ''} mengalami kendala.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-3 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-semibold"
          >
            Coba Lagi
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
