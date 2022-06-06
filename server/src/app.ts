import express = require('express');
import path = require('path');
import cors = require('cors');
import helmet from 'helmet';
import { errorHandler } from './error';
import { handleHealth } from './health';
import { loggers } from './logger';
import { handleRender } from './render';

const development = !process.env.SEQUENCE_PRODUCTION;
const port = process.env.SEQUENCE_PORT || 3000;
const dist = path.join(__dirname, '..', '..', 'frontend', 'build');

console.log('starting Sequence server, parameters:');
console.log(' - production: ' + (development ? 'false' : 'true'));
console.log(' - dist: ' + dist);
console.log(' - port: ' + port);

const app = express();
const [requestLogger, errorLogger] = loggers(development);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(requestLogger);
app.disable('x-powered-by');

// serve a few things specifically
app.get('/render/:diagram', handleRender);
app.get('/health', handleHealth);
app.use(express.static(dist));

// delegate to the frontend for all other routes
app.use((_, response) => response.sendFile(path.join(dist, 'index.html')));

app.use(errorLogger);
app.use(errorHandler);

app.listen(port, () => {
   return console.log(`express is now listening`);
});
