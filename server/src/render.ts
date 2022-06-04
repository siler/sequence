import { Request, Response, NextFunction } from 'express';
import { decode } from './decode';
import { writeResponse } from './response';
import { drawBuffer } from './draw';
import { HttpError } from 'http-errors';
import createError = require('http-errors');

export const handleRender = async (
   request: Request<{ diagram: string }>,
   response: Response,
   next: NextFunction
): Promise<void | HttpError> => {
   const decodeRes = await decode(request.params.diagram);
   if (decodeRes.type === 'error') {
      return createError(400, 'invalid input: ' + decodeRes.error);
   }

   const drawRes = drawBuffer(decodeRes.value);
   if (drawRes.type === 'error') {
      return next(drawRes.error);
   }

   return writeResponse(response, next, drawRes.value, 'image/png');
};
