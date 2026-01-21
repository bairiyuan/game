import log from 'electron-log'
log.transports.console.level = 'info'
log.transports.console.format = '{h}:{i}:{s} [{level}] {text}'
log.transports.console.useStyles = true

log.transports.file.level = 'warn'
log.transports.file.maxSize = 10 * 1024 * 1024

export const consoleLogger = {
  info: (...messages: any[]) => {
    console.log(...messages)
  },
  warn: (...messages: any[]) => {
    console.warn(...messages)
  },
  error: (...messages: any[]) => {
    console.error(...messages)
  },
  debug: (...messages: any[]) => {
    console.debug(...messages)
  }
}

if (process.env.NODE_ENV === 'production') {
  consoleLogger.info = () => {}
  consoleLogger.warn = () => {}
  consoleLogger.error = (...messages: any[]) => log.error(...messages)
  consoleLogger.debug = (...messages: any[]) => log.debug(...messages)
}
