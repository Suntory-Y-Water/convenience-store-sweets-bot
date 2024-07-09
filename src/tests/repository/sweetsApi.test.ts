import { Constants } from '../../constants';
import { container } from '../../containers/inversify.config';
import { TYPES } from '../../containers/inversify.types';
import { SweetsApiRepository } from '../../repositories/sweetsApiRepository';

describe('SweetsApiRepository', () => {
  let sweetsApiRepository: SweetsApiRepository;

  beforeEach(() => {
    sweetsApiRepository = container.get(TYPES.SweetsApiRepository);
  });

  test('fetchTextResponseが正しくデータを返却する', async () => {
    // arrange
    const apiUrl = 'https://i-scream.ayasnppk00.workers.dev/';
    const headers = {
      'User-Agent': Constants.USER_AGENT,
    };
    // act
    const result = await sweetsApiRepository.fetchTextResponse(apiUrl, headers);

    // assert
    expect(result).not.toBeNull();
  });

  test('fetchTextResponseがエラー時に例外を投げる', async () => {
    // arrange
    const apiUrl = 'https://i-scream.ayasnppk00.workers.dev/hoge';
    const headers = {
      'User-Agent': Constants.USER_AGENT,
    };

    // act and assert
    await expect(sweetsApiRepository.fetchTextResponse(apiUrl, headers)).rejects.toThrow(
      `Failed to fetch text response from url`,
    );
  });
});
