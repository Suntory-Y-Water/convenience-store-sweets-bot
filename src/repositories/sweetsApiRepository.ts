import { ISweetsApiRepository } from '../interfaces/sweetsApiInterface';

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
