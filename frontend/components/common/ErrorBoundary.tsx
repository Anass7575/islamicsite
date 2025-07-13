'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  isolate?: boolean
  level?: 'page' | 'section' | 'component'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null
  private previousResetKeys: Array<string | number> = []

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props
    const { errorCount } = this.state

    // Log error with context
    logger.error(`Error in ${level}`, error, {
      component: errorInfo.componentStack,
      level,
      errorCount: errorCount + 1,
      props: this.props
    })

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo)
    }

    // Update state
    this.setState({
      errorInfo,
      errorCount: errorCount + 1
    })

    // Auto-reset after 3 errors to prevent infinite loops
    if (errorCount >= 2) {
      this.resetTimeoutId = setTimeout(() => {
        this.resetErrorBoundary()
      }, 5000)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError) {
      // Reset on prop changes if enabled
      if (resetOnPropsChange && prevProps.children !== this.props.children) {
        this.resetErrorBoundary()
        return
      }

      // Reset on resetKeys change
      if (resetKeys && this.previousResetKeys.join(',') !== resetKeys.join(',')) {
        this.previousResetKeys = resetKeys
        this.resetErrorBoundary()
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
      this.resetTimeoutId = null
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    })
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback, isolate, level = 'component' } = this.props

    if (hasError && error) {
      // Default fallback UI
      if (!fallback) {
        return (
          <div className="error-boundary-fallback p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold mb-2">
                {level === 'page' ? 'Page Error' : 'Something went wrong'}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {level === 'page' 
                  ? 'This page encountered an error and cannot be displayed.'
                  : 'This component encountered an error.'}
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="text-left mb-4">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Error details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                    {error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <button
                onClick={this.resetErrorBoundary}
                className="px-4 py-2 bg-islamic-600 text-white rounded hover:bg-islamic-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )
      }

      return <>{fallback}</>
    }

    // Wrap in isolation container if specified
    if (isolate) {
      return (
        <div className="error-boundary-container" data-isolated="true">
          {children}
        </div>
      )
    }

    return children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Async error boundary for handling async errors
export function AsyncErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <ErrorBoundary
      fallback={fallback}
      level="component"
      resetOnPropsChange
    >
      {children}
    </ErrorBoundary>
  )
}