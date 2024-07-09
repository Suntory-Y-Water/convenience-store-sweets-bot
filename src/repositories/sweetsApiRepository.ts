import { HTTPException } from 'hono/http-exception';
import { injectable } from 'inversify';
import 'reflect-metadata';
export interface ISweetsApiRepository {
  /**
   *
   * @description fetch text response from url
   * @param {string} url
   * @param {Record<string, string>} [headers]
   * @return {*}  {Promise<string>}
   * @memberof ISweetsApiRepository
   */
  fetchTextResponse(url: string, headers?: Record<string, string>): Promise<string>;
}

@injectable()
export class SweetsApiRepository implements ISweetsApiRepository {
  fetchTextResponse = async (
    apiUrl: string,
    headers?: Record<string, string>,
  ): Promise<string> => {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          ...headers,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new HTTPException(500, {
          message: `Failed to fetch response. response : ${errorResponse}`,
        });
      }

      return await response.text();
    } catch (error) {
      throw new HTTPException(500, { message: 'Failed to fetch text response from url' });
    }
  };
}
