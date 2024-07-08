import { MiddlewareHandler } from 'hono';
import { container } from '../containers/inversify.config';

export const injectDependencies: MiddlewareHandler = async (c, next) => {
  c.set('diContainer', container);
  return next();
};
