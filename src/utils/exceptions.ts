import { StatusCode } from 'hono/utils/http-status';

/**
 * @description KVからの例外時に使用するエラークラス
 * @class KVException
 * @extends {Error}
 */
export class KVException extends Error {
  public status: StatusCode;
  public method?: string;

  constructor(status: StatusCode, message: string, method?: string) {
    super(message);
    this.status = status;
    this.method = method;
  }
}
