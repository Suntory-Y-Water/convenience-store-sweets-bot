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
    const response = await fetch(apiUrl, {
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} url: ${apiUrl}`);
    }

    return await response.text();
  };
}
