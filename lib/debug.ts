/**
 * 🔍 2026 Expert Debugging System
 * Comprehensive logging and error tracking for production debugging
 */

export interface DebugContext {
  userId?: string
  action: string
  timestamp: string
  environment: string
  deployment: string
}

export class DebugLogger {
  private static instance: DebugLogger
  private logs: Array<DebugContext & { message: string; error?: Error }> = []

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger()
    }
    return DebugLogger.instance
  }

  log(context: DebugContext, message: string, error?: Error) {
    const logEntry = {
      ...context,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    }
    
    this.logs.push(logEntry)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG:', logEntry)
    }
    
    // Log to Vercel in production
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 PRODUCTION DEBUG:', JSON.stringify(logEntry))
    }
  }

  getLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

export function createDebugContext(action: string, userId?: string): DebugContext {
  return {
    userId,
    action,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    deployment: process.env.VERCEL_URL || 'local'
  }
}

export function logError(context: DebugContext, message: string, error: Error) {
  const logger = DebugLogger.getInstance()
  logger.log(context, message, error)
}

export function logSuccess(context: DebugContext, message: string) {
  const logger = DebugLogger.getInstance()
  logger.log(context, message)
}
