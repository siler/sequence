import { Response } from 'express';
import createError = require('http-errors');
import express = require('express');
import logger = require('morgan');
import path = require('path');

import { process } from './process';
import { PNGStream } from 'canvas';

const app = express();
const router = express.Router();
const port = 3000;
const dist = path.join(__dirname, '..', '..', 'frontend', 'build');

router.get('*', async (req, res, next) => {
   const diagram = req.query['diagram'];
   if (typeof diagram !== 'string') {
      return next(createError(400, 'missing diagram'));
   }

   const result = await process(diagram);
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

app.get('/render', router);
app.use(logger('dev'));
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
