"use strict";

var nodemailer = require('nodemailer'),
    wlog = require('winston'),
    transport = nodemailer.createTransport("Direct", {debug: true});
/*   transport = nodemailer.createTransport("sendmail",{
   path: "/usr/sbin/sendmail",
   args: ["-t", "-f", "warmd@wrct.org"]
   });*/



wlog.info("Direct Transport configured");

var message = {
    to: '"Information Systems Manager" <mbaron50@gmail.com>',
    from: "warmd@wrct.org",
    subject: 'WARMD mail config message!',
    text: 'Hello, from inside a config. Still trying to populate with js variables, but have some log files instead.',
       attachments:
       { fileName: '../logs/info.log',
         contents: 'Info log',
         contentType: 'text/plain'
       }};

/*transport.sendMail(message, function(error, response){
  if (error){
     wlog.error('Error occured');
     wlog.error(error.message);
     return;
  } else {
    wlog.info('Message sent successfully');
  }
});*/

module.exports = transport;
