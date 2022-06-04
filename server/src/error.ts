import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import createError = require('http-errors');

export const errorHandler = (
   error: TypeError | HttpError,
   _request: Request,
   response: Response,
   next: NextFunction
) => {
   if (process.env.NODE_ENV === 'production') {
      response.writeHead(error instanceof HttpError ? error.statusCode : 500);
      response.end();
      return;
   }

   next(error);
};

export type Result<V, E> = Success<V> | Error<E>;

export interface Success<V> {
   type: 'success';
   value: V;
}

export const newSuccess = <T>(value: T): Success<T> => {
   return { type: 'success', value };
};

export interface Error<E> {
   type: 'error';
   error: E;
}

export const newError = <T>(message: T): Error<T> => {
   return { type: 'error', error: message };
};

export const fail = (code: number, message: string): Error<HttpError> => {
   return newError(createError(code, message));
};
