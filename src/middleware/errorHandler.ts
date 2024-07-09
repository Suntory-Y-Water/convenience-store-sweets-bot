import { Context } from 'hono';
import { KVException, ParseException } from '../utils/exceptions';
import { ErrorResponse } from '../types';
import { HTTPException } from 'hono/http-exception';

export const errorHandler = (err: Error, c: Context) => {
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  if (err instanceof KVException) {
    return c.json<ErrorResponse>(
      {
        message: err.message,
        method: err.method,
        timestamp: now,
      },
      err.status,
    );
  }
  if (err instanceof HTTPException || err instanceof ParseException) {
    return c.json<ErrorResponse>(
      {
        message: err.message,
        timestamp: now,
      },
      err.status,
    );
  }
  return c.json<ErrorResponse>(
    {
      message: err.message ?? 'something unexpected happened',
      timestamp: now,
    },
    500,
  );
};
