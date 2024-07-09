/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from 'inversify';
import 'reflect-metadata';
import { LineErrorMessage, SentMessage } from '../../types';
import { ILineRepository } from '../../repositories/lineRepository';

@injectable()
export class MockLineRepository implements ILineRepository {
  private sentMessage: SentMessage = {
    id: 'SUCCESS',
  };

  private errorMessage: LineErrorMessage = {
    message: 'Mock Error Message',
  };

  replyMessage = async <T>(
    message: T,
    replyToken: string,
    accessToken: string,
  ): Promise<LineErrorMessage | SentMessage> => {
    if (replyToken === 'error') {
      return this.errorMessage;
    }
    return this.sentMessage;
  };

  pushMessage = async <T>(
    message: T,
    userId: string,
    accessToken: string,
  ): Promise<LineErrorMessage | SentMessage> => {
    if (userId === 'error') {
      return this.errorMessage;
    }
    return this.sentMessage;
  };

  loadingAnimation = async (
    userId: string,
    accessToken: string,
  ): Promise<LineErrorMessage | SentMessage> => {
    if (userId === 'error') {
      return this.errorMessage;
    }
    return this.sentMessage;
  };
}
