import { NextFunction, Response } from 'express';
import createError = require('http-errors');

export const writeResponse = async (
   response: Response,
   next: NextFunction,
   data: Buffer | string,
   mime: string
) => {
   const buffer = data instanceof Buffer ? data : Buffer.from(data);
   const message = 'failed to write stream of ' + mime;
   response.writeHead(200, { 'Content-Type': mime });
   try {
      await writeBuffer(response, buffer);
   } catch (error) {
      if (error instanceof Error) {
         return next(createError(500, message, error));
      } else {
         return next(createError(500, message));
      }
   }
   response.end();
};

export const writeBuffer = async (response: Response, data: Buffer) => {
   return new Promise<void>((resolve, reject) => {
      response.write(data, (err) => {
         if (err) {
            reject(err);
         } else {
            resolve();
         }
      });
   });
};
