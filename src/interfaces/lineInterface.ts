import { LineErrorMessage, SentMessage } from '../model/line';

export interface ILineRepository {
  replyMessage<T>(
    message: T,
    replyToken: string,
    accessToken: string,
  ): Promise<SentMessage | LineErrorMessage>;
}
