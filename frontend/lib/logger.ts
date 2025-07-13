/**
 * Centralized logging system for production-ready applications
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
  userId?: string
  sessionId?: string
  traceId?: string
}

class Logger {
  private isDevelopment: boolean
  private logBuffer: LogEntry[] = []
  private maxBufferSize = 100
  private flushInterval = 30000 // 30 seconds
  private apiEndpoint = '/api/logs'

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    
    // Periodically flush logs in production
    if (!this.isDevelopment) {
      setInterval(() => this.flush(), this.flushInterval)
      
      // Flush on page unload
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => this.flush())
      }
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      traceId: this.getTraceId()
    } as LogEntry
  }

  private getUserId(): string | undefined {
    // Get from auth context or localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || undefined
    }
    return undefined
  }

  private getSessionId(): string | undefined {
    // Get or create session ID
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('sessionId')
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('sessionId', sessionId)
      }
      return sessionId
    }
    return undefined
  }

  private getTraceId(): string | undefined {
    // Get trace ID from headers or generate one
    if (typeof window !== 'undefined') {
      return window.performance?.getEntriesByType('navigation')[0]?.name || undefined
    }
    return undefined
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.isDevelopment ? 'debug' : 'info')
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return

    const logs = [...this.logBuffer]
    this.logBuffer = []

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      })
    } catch (error) {
      // Fallback to console in case of error
      if (this.isDevelopment) {
        console.error('Failed to flush logs:', error)
      }
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('debug')) return

    const entry = this.createLogEntry('debug', message, context)
    
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '')
    } else {
      this.addToBuffer(entry)
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('info')) return

    const entry = this.createLogEntry('info', message, context)
    
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '')
    } else {
      this.addToBuffer(entry)
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('warn')) return

    const entry = this.createLogEntry('warn', message, context)
    
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '')
    } else {
      this.addToBuffer(entry)
    }
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    if (!this.shouldLog('error')) return

    const errorObj = error instanceof Error ? error : new Error(String(error))
    const entry = this.createLogEntry('error', message, context, errorObj)
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, errorObj, context || '')
    } else {
      this.addToBuffer(entry)
      
      // Immediately flush errors in production
      if (this.logBuffer.length > 0) {
        this.flush()
      }
    }

    // Send to error tracking service
    this.sendToErrorTracking(errorObj, context)
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry)
    
    // Flush if buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush()
    }
  }

  private sendToErrorTracking(error: Error, context?: Record<string, any>): void {
    // Integration with Sentry or similar service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: context
      })
    }
  }

  // Performance logging
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label)
    } else {
      performance.mark(`${label}-start`)
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label)
    } else {
      performance.mark(`${label}-end`)
      try {
        performance.measure(label, `${label}-start`, `${label}-end`)
        const measure = performance.getEntriesByName(label)[0]
        this.info(`Performance: ${label}`, { duration: measure.duration })
      } catch (error) {
        // Ignore if marks don't exist
      }
    }
  }

  // Table logging for development
  table(data: any[], columns?: string[]): void {
    if (this.isDevelopment) {
      console.table(data, columns)
    }
  }

  // Group logging
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label)
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd()
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export types
export type { LogLevel, LogEntry }