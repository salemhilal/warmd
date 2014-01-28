module.exports = function(app) {

  app.get("/ping", function(req,res) {
    res.end("pong");
  });

};
