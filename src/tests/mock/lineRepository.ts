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
    _message: T,
    replyToken: string,
    _accessToken: string,
  ): Promise<LineErrorMessage | SentMessage> => {
    if (replyToken === 'error') {
      return this.errorMessage;
    }
    return this.sentMessage;
  };

  pushMessage = async <T>(
    _message: T,
    userId: string,
    _accessToken: string,
  ): Promise<LineErrorMessage | SentMessage> => {
    if (userId === 'error') {
      return this.errorMessage;
    }
    return this.sentMessage;
  };

  loadingAnimation = async (
    userId: string,
    _accessToken: string,
  ): Promise<LineErrorMessage | SentMessage> => {
    if (userId === 'error') {
      return this.errorMessage;
    }
    return this.sentMessage;
  };
}
