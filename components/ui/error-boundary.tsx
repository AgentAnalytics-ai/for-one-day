'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { EnhancedButton } from './enhanced-button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 * Beautiful error handling with recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
            Something went wrong
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-md">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>
          <div className="flex gap-4">
            <EnhancedButton
              onClick={this.handleReset}
              variant="primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </EnhancedButton>
            <EnhancedButton
              onClick={() => window.location.reload()}
              variant="secondary"
            >
              Reload Page
            </EnhancedButton>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 text-left max-w-2xl">
              <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                {this.state.error.toString()}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
