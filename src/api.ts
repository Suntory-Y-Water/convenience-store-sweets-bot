import { Hono } from 'hono';
import { Bindings, GetSweetsDetailParams } from './types';
import { getSweetsDetail, fetchSweetsUrl } from './model';
import * as constants from './constants';

const router = new Hono<{ Bindings: Bindings }>();
router.get('/', async (c) => {
  const response = await fetchSweetsUrl(
    constants.convenienceStoreItemUrls.sevenElevenWesternSweetsUrl,
  );
  const params: GetSweetsDetailParams = {
    responseHtml: response,
    ...constants.sevenElevenParams,
  };

  const data = await getSweetsDetail(params);

  return c.json(data);
});

export default router;
