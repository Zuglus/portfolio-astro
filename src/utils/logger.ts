export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

const logger: Logger = {
  debug: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.debug(...args)
    }
  },
  info: (...args: unknown[]) => {
    console.info(...args)
  },
  warn: (...args: unknown[]) => {
    console.warn(...args)
  },
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}

export default logger
