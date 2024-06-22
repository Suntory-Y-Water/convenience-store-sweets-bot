export interface ISweetsApiRepository {
  fetchTextResponse(url: string, headers?: Record<string, string>): Promise<string>;
}
