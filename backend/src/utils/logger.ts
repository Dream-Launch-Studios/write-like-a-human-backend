import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const ERROR_LOG_PATH = path.join(logsDir, 'error.log');
const INFO_LOG_PATH = path.join(logsDir, 'info.log');
const DEBUG_LOG_PATH = path.join(logsDir, 'debug.log');

// ANSI color codes for console output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
};

// Available log levels
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Simple logger class that logs to console and files
 */
export class Logger {
  private module: string;
  private enableConsole: boolean;
  private enableFile: boolean;
  private minLevel: LogLevel;
  
  // Log level priority (lower number = higher priority)
  private static readonly LEVEL_PRIORITY: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };

  /**
   * Create a new logger instance
   * @param module Name of the module using this logger
   * @param options Configuration options
   */
  constructor(
    module: string, 
    options: { 
      enableConsole?: boolean, 
      enableFile?: boolean, 
      minLevel?: LogLevel 
    } = {}
  ) {
    this.module = module;
    this.enableConsole = options.enableConsole ?? true;
    this.enableFile = options.enableFile ?? true;
    this.minLevel = options.minLevel ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  }
  
  /**
   * Checks if the given level should be logged based on the minimum level setting
   */
  private shouldLog(level: LogLevel): boolean {
    return Logger.LEVEL_PRIORITY[level] <= Logger.LEVEL_PRIORITY[this.minLevel];
  }

  /**
   * Format timestamp for log messages
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }
  
  /**
   * Format a message with module name, timestamp and any additional context
   */
  private formatMessage(level: LogLevel, message: string, context?: any): string {
    const timestamp = this.getTimestamp();
    
    let contextStr = '';
    if (context) {
      try {
        // Format context based on type
        if (typeof context === 'string') {
          contextStr = context;
        } else if (context instanceof Error) {
          contextStr = `${context.message}\n${context.stack}`;
        } else {
          contextStr = JSON.stringify(context);
        }
      } catch (e) {
        contextStr = '[Unserializable context]';
      }
    }
    
    // Format for console/file
    return contextStr 
      ? `[${timestamp}] [${level.toUpperCase()}] [${this.module}] ${message} | ${contextStr}`
      : `[${timestamp}] [${level.toUpperCase()}] [${this.module}] ${message}`;
  }
  
  /**
   * Write a log message to console with appropriate color
   */
  private logToConsole(level: LogLevel, formattedMessage: string): void {
    if (!this.enableConsole) return;
    
    let color = COLORS.WHITE;
    switch (level) {
      case 'error':
        color = COLORS.RED;
        console.error(`${color}${formattedMessage}${COLORS.RESET}`);
        break;
      case 'warn':
        color = COLORS.YELLOW;
        console.warn(`${color}${formattedMessage}${COLORS.RESET}`);
        break;
      case 'info':
        color = COLORS.GREEN;
        console.info(`${color}${formattedMessage}${COLORS.RESET}`);
        break;
      case 'debug':
        color = COLORS.BLUE;
        console.debug(`${color}${formattedMessage}${COLORS.RESET}`);
        break;
    }
  }
  
  /**
   * Write a log message to the appropriate file
   */
  private logToFile(level: LogLevel, formattedMessage: string): void {
    if (!this.enableFile) return;
    
    const logEntry = `${formattedMessage}\n`;
    
    try {
      // Always log errors to the error log
      if (level === 'error') {
        fs.appendFileSync(ERROR_LOG_PATH, logEntry);
      }
      
      // Log everything to the appropriate level log
      switch (level) {
        case 'error':
        case 'warn':
        case 'info':
          fs.appendFileSync(INFO_LOG_PATH, logEntry);
          break;
      }
      
      // Debug logs go to debug file only
      if (level === 'debug') {
        fs.appendFileSync(DEBUG_LOG_PATH, logEntry);
      }
    } catch (e) {
      // If file logging fails, at least try to output to console
      console.error(`Failed to write to log file: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  
  /**
   * Log a message at the specified level
   */
  private log(level: LogLevel, message: string, context?: any): void {
    if (!this.shouldLog(level)) return;
    
    const formattedMessage = this.formatMessage(level, message, context);
    
    this.logToConsole(level, formattedMessage);
    this.logToFile(level, formattedMessage);
  }
  
  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: any): void {
    let combinedContext = context;
    
    // If error object is provided, include it in the context
    if (error) {
      combinedContext = {
        ...(typeof context === 'object' ? context : { additionalContext: context }),
        error: {
          message: error.message,
          stack: error.stack
        }
      };
    }
    
    this.log('error', message, combinedContext);
  }
  
  /**
   * Log warning message
   */
  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }
  
  /**
   * Log info message
   */
  info(message: string, context?: any): void {
    this.log('info', message, context);
  }
  
  /**
   * Log debug message
   */
  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }
  
  /**
   * Create a child logger with a sub-module name
   */
  child(childModule: string): Logger {
    return new Logger(`${this.module}:${childModule}`, {
      enableConsole: this.enableConsole,
      enableFile: this.enableFile,
      minLevel: this.minLevel
    });
  }
  
  /**
   * Start timing an operation
   * @returns Function that returns the elapsed time in milliseconds
   */
  startTimer(): () => number {
    const start = Date.now();
    return () => Date.now() - start;
  }
  
  /**
   * Log a timed operation
   */
  logTimed(level: LogLevel, message: string, elapsedMs: number, context?: any): void {
    const timedContext = {
      ...(typeof context === 'object' ? context : { additionalContext: context }),
      elapsedMs
    };
    
    this.log(level, message, timedContext);
  }
}

/**
 * Create a logger with default configuration
 */
export function createLogger(module: string): Logger {
  return new Logger(module);
}