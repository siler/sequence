import winston = require('winston');
import expressWinston = require('express-winston');

export const loggers = (development: boolean) => {
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
   const requestLogger = expressWinston.logger({
      transports: [consoleTransport],
      colorize: development,
      ignoreRoute: function (request) {
         if (request.originalUrl === '/ws') {
            return true;
         }
         return false;
      },
   });

   const errorLogger = expressWinston.errorLogger({
      transports: [consoleTransport],
   });

   return [requestLogger, errorLogger];
};
