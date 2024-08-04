/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { injectable } from 'inversify';

enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
}

export interface ILoggingService {
  log(methodName: string, ...messages: any[]): void;
  error(methodName: string, ...messages: any[]): void;
}

@injectable()
export class LoggingService implements ILoggingService {
  log(methodName: string, ...messages: any[]): void {
    this.printLog(LogLevel.INFO, methodName, this.stringifyMessages(messages));
  }

  error(methodName: string, ...messages: any[]): void {
    this.printLog(LogLevel.ERROR, methodName, this.stringifyMessages(messages));
  }

  private printLog(level: LogLevel, methodName: string, message: string): void {
    const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const formattedMessage = this.formatLog(level, timestamp, methodName, message);
    console.log(formattedMessage);
  }

  private formatLog(
    level: LogLevel,
    timestamp: string,
    methodName: string,
    message: string,
  ): string {
    return `${timestamp} ${level} [${methodName}] ${message}`;
  }

  private stringifyMessages(messages: any[]): string {
    return messages
      .map((message) => {
        if (typeof message === 'object' && message !== null) {
          return JSON.stringify(message, null, 2);
        }
        return String(message);
      })
      .join(' ');
  }
}
