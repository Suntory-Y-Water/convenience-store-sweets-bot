import { Hono } from 'hono';
import router from './api';
import { doSomeTaskOnASchedule } from './model';
import { Bindings } from './types';

const app = new Hono();
app.route('/api', router);
const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (event, env, ctx) => {
  ctx.waitUntil(doSomeTaskOnASchedule(env));
};

export default {
  fetch: app.fetch,
  scheduled,
};
