/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { injectable } from 'inversify';

enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
}

export interface ILoggingService {
  log(message: any): void;
  error(message: any): void;
}

@injectable()
export class LoggingService implements ILoggingService {
  log(message: any): void {
    this.printLog(LogLevel.INFO, this.stringifyMessage(message));
  }

  error(message: any): void {
    this.printLog(LogLevel.ERROR, this.stringifyMessage(message));
  }

  private printLog(level: LogLevel, message: string): void {
    const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const formattedMessage = this.formatLog(level, timestamp, message);
    console.log(formattedMessage);
  }

  private formatLog(level: LogLevel, timestamp: string, message: string): string {
    return `${timestamp} ${level} ${message}`;
  }

  private stringifyMessage(message: any): string {
    if (typeof message === 'object') {
      return JSON.stringify(message, null, 2);
    }
    return String(message);
  }
}
