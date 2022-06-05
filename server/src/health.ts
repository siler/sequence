import { NextFunction, Request, Response } from 'express';
import { drawBuffer, drawUrl } from './draw';
import { writeResponse } from './response';
import createError = require('http-errors');

export const handleHealth = async (
   request: Request,
   response: Response,
   next: NextFunction
) => {
   const code = `title: Sincerely,
Me -> You
   label: Thanks.`;
   if (request.accepts('png')) {
      const result = drawBuffer(code);
      if (result.type === 'success') {
         return writeResponse(response, next, result.value, 'image/png');
      }
      return next(createError(500, 'rendering png', result.error));
   } else if (request.accepts('html')) {
      const result = drawUrl(code);
      if (result.type === 'error') {
         return next(result.error);
      }

      const html = `<!DOCTYPE html>
<html>
   <head>
      <title>Aw geez</title>
   </head>
   <body>
      <img src="${result.value}" />
   </body>
</html>`;
      return writeResponse(response, next, html, 'text/html');
   } else if (request.accepts('json')) {
      const result = drawUrl(code);
      if (result.type === 'error') {
         return next(result.error);
      }
      const json = `{
   "aHealthyUrl": "${result.value}"
}`;
      return writeResponse(response, next, json, 'application/json');
   } else {
      const result = drawUrl(code);
      if (result.type === 'error') {
         return next(result.error);
      }
      return writeResponse(response, next, result.value, 'text');
   }
};
