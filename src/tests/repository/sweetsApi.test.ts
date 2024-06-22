import { Constants } from '../../constants';
import { diContainer } from '../../containers/diConfig';
import { SweetsApiRepository } from '../../repositories/sweetsApiRepository';

// TODO: fetch関数のmock化がうまくできていないので、自分が過去に作成したAPIを利用してテストを行う
describe('SweetsApiRepository', () => {
  let sweetsApiRepository: SweetsApiRepository;

  beforeEach(() => {
    sweetsApiRepository = diContainer.get('SweetsApiRepository');
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
      `HTTP error! status: 404 url: ${apiUrl}`,
    );
  });
});
