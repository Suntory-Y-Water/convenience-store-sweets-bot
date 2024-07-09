import { TYPES } from '../../containers/inversify.types';
import { mockDiContainer } from '../mock/inversify.config';
import { MockLineRepository } from '../mock/lineRepository';

describe('LineRepository', () => {
  let lineRepository: MockLineRepository;

  beforeEach(() => {
    lineRepository = mockDiContainer.get(TYPES.LineRepository);
  });

  test('replyMessage should return sentMessage when replyToken is valid', async () => {
    const message = { type: 'text', text: 'Hello' };
    const replyToken = 'valid_token';
    const accessToken = 'access_token';
    const response = await lineRepository.replyMessage(message, replyToken, accessToken);

    expect(response).toEqual({ id: 'SUCCESS' });
  });

  test('replyMessage should return errorMessage when replyToken is "error"', async () => {
    const message = { type: 'text', text: 'Hello' };
    const replyToken = 'error';
    const accessToken = 'access_token';
    const response = await lineRepository.replyMessage(message, replyToken, accessToken);

    expect(response).toEqual({ message: 'Mock Error Message' });
  });

  test('pushMessage should return sentMessage when userId is valid', async () => {
    const message = { type: 'text', text: 'Hello' };
    const userId = 'valid_user';
    const accessToken = 'access_token';
    const response = await lineRepository.pushMessage(message, userId, accessToken);

    expect(response).toEqual({ id: 'SUCCESS' });
  });

  test('pushMessage should return errorMessage when userId is "error"', async () => {
    const message = { type: 'text', text: 'Hello' };
    const userId = 'error';
    const accessToken = 'access_token';
    const response = await lineRepository.pushMessage(message, userId, accessToken);

    expect(response).toEqual({ message: 'Mock Error Message' });
  });

  test('loadingAnimation should return sentMessage when userId is valid', async () => {
    const userId = 'valid_user';
    const accessToken = 'access_token';
    const response = await lineRepository.loadingAnimation(userId, accessToken);

    expect(response).toEqual({ id: 'SUCCESS' });
  });

  test('loadingAnimation should return errorMessage when userId is "error"', async () => {
    const userId = 'error';
    const accessToken = 'access_token';
    const response = await lineRepository.loadingAnimation(userId, accessToken);

    expect(response).toEqual({ message: 'Mock Error Message' });
  });
});
