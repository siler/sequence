import express = require('express');
import logger = require('morgan');
import path = require('path');
import cors = require('cors');

import { handleRender } from './render';
import { errorHandler } from './error';
import helmet from 'helmet';
import { handleHealth } from './health';

const port = process.env.REACT_APP_PORT || 3000;
const dist = path.join(__dirname, '..', '..', 'frontend', 'build');

const app = express();

app.use(
   helmet({
      contentSecurityPolicy: false,
   })
);
app.use(cors());
app.use(logger('dev'));
app.disable('x-powered-by');

// serve a few things specifically
app.get('/render/:diagram', handleRender);
app.get('/health', handleHealth);
app.use(express.static(dist));

// delegate to the frontend for all other routes
app.use((_, response) => response.sendFile(path.join(dist, 'index.html')));

app.use(errorHandler);

app.listen(port, () => {
   return console.log(`Express is listening at http://localhost:${port}`);
});
