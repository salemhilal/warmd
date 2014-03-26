var nodemailer = require('nodemailer'),
    wlog = require('winston'),
/*   transport = nodemailer.createTransport("sendmail",{
   path: "/usr/sbin/sendmail",
   args: ["-t", "-f", "warmd@wrct.org"]
   });*/
    transport = nodemailer.createTransport("Direct", {debug: true});



wlog.info("Direct Transport configured");

var message = {
    to: '"Information Systems Manager" <salemhilal@gmail.com>',
    from: "warmd@wrct.org",
    subject: 'WARMD mail config message!',
    text: 'Hello, from inside a config. Still trying to populate with js variables, but have some log files instead.',
       attachments:
       { fileName: '../logs/info.log',
         contents: 'Info log',
         contentType: 'text/plain'
       }};

console.log("Sending Mail");

transport.sendMail(message, function(error, response){
      if (error){
         wlog.error('Error occured');
         wlog.error(error.message);
         return;
      } else {
      wlog.info(response);
      wlog.info('Message sent successfully');
      }
});




module.exports = transport;
