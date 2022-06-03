import { Response } from 'express';
import createError = require('http-errors');
import express = require('express');
import logger = require('morgan');
import path = require('path');

import { process } from './process';

const app = express();
const render = express.Router();
const port = 8080;
const dist = path.join(__dirname, '..', '..', 'frontend', 'build');

app.use(logger('dev'));
app.get('/render/:diagram', async (req, res, next) => {
   const result = await process(req.params.diagram);
   if (result.type === 'error') {
      return next(result.error);
   }

   res.writeHead(200, { 'Content-Type': 'image/png' });
   try {
      await writer(res, result.value);
   } catch (err) {
      if (err instanceof Error) {
         return next(
            createError(500, `failed to write PNG stream: ${err.message}`)
         );
      }
   }
   res.end();
});
app.use(express.static(dist));
app.get('*', (_, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(port, () => {
   return console.log(`Express is listening at http://localhost:${port}`);
});

const writer = async (res: Response, stream: Buffer) => {
   return new Promise<void>((resolve, reject) => {
      res.write(stream, (err) => {
         if (err) {
            reject(err);
         } else {
            resolve();
         }
      });
   });
};
