import { scheduledEvent } from '../..';

const env = getMiniflareBindings();
describe('Cron triggers scheduled events', () => {
  // 実際のAPIリクエストを行うため、実施するとき以外はスキップにする
  test.skip('scheduledEvent is called', async () => {
    // arrange & act
    const response = await scheduledEvent(env);

    // assert
    expect(response).toEqual(new Response(null, { status: 201 }));
  });
});
