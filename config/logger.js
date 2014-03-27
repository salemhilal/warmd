var winston = require('winston'),
    Mail = require('winston-mail');

// Setting up custom logging
var WARMDLogLevels = {
   levels: {
      trace: 0,
      debug: 1,
      info: 2,
      auth: 3,
      warn: 4,
      error: 5,
      fatal: 6
   },
   colors: {
      trace: 'white',
      debug: 'blue',
      info: 'green',
      auth: 'green',
      warn: 'orange',
      error: 'red',
      fatal: 'red'
   }
};

var warmdLog = new (winston.Logger)({
   levels: WARMDLogLevels.levels,
   colors: WARMDLogLevels.colors,

   transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)( {filename: './logs/error.log', name: 'file.error', level: 'error'}),
      new (winston.transports.File)( {filename: './logs/info.log', name: 'file.info', level: 'info'}),
      new (winston.transports.File)( {filename: './logs/auth.log', name: 'file.auth', level: 'auth'}),
      new (winston.transports.Mail)( {  // send mail on fatal error
         to: 'mbaron50@gmail.com',
         from: 'warmd@wrct.org',
         host: 'eleven.wrct.org',
         level: 'fatal'
      })
   ]
});

module.exports = warmdLog;

