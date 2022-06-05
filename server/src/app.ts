import express = require('express');
import winston = require('winston');
import expressWinston = require('express-winston');
import path = require('path');
import cors = require('cors');

import helmet from 'helmet';
import { errorHandler } from './error';
import { handleHealth } from './health';
import { handleRender } from './render';

const development = !process.env.SEQUENCE_PRODUCTION;
const port = process.env.SEQUENCE_PORT || 3000;
const dist = path.join(__dirname, '..', '..', 'frontend', 'build');

console.log('starting Sequence server, parameters:');
console.log(' - dist: ' + dist);
console.log(' - port: ' + port);
console.log(' - production: ' + (development ? 'false' : 'true'));

let format;
if (development) {
   format = winston.format.combine(
      winston.format.colorize(),
      winston.format.prettyPrint()
   );
} else {
   format = winston.format.json();
}

const consoleTransport = new winston.transports.Console({ format });

const app = express();

app.use(
   helmet({
      contentSecurityPolicy: false,
   })
);
app.use(cors());
app.use(
   expressWinston.logger({
      transports: [consoleTransport],
      colorize: development,
      ignoreRoute: function (request) {
         if (request.originalUrl === '/ws') {
            return true;
         }
         return false;
      },
   })
);
app.disable('x-powered-by');

// serve a few things specifically
app.get('/render/:diagram', handleRender);
app.get('/health', handleHealth);
app.use(express.static(dist));

// delegate to the frontend for all other routes
app.use((_, response) => response.sendFile(path.join(dist, 'index.html')));

app.use(
   expressWinston.errorLogger({
      transports: [consoleTransport],
   })
);

app.use(errorHandler);

app.listen(port, () => {
   return console.log(`express is now listening`);
});
