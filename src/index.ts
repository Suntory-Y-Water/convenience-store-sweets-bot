import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import router from './api';

const app = new Hono();
app.use(prettyJSON());
app.route('/api', router);

export default {
  fetch: app.fetch,
};
