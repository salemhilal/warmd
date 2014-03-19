var DB = require('bookshelf').DB,
    Playlist = DB.Playlist;


module.exports = {

  load: function(req, res, next, id) {
    Playlist.
      forge({ PlayListID: id}).
      fetch({
        withRelated: ['plays'],
        require: true,
      }).
      then(function(user) {
        req.playlist = playlist;
        next();
      }, function(err) {
        next(err);
      });
  },

  create: function(req, res) {
    var newPlaylist = req.body
    new Playlist({
      StartTime: newPlaylist.startTime,
      EndTime: newPlaylist.endTime,
      UserID: newPlaylist.userID,
      Comment: newPlaylist.comment
    }).save().then(function(model) {
      res.json(200, model);
    });
  },

  show: function(req, res) {
    // TODO: Do we need an HTML view here?
    res.json(req.playlist.attributes);
  },

  update: function(req, res) {
    var id = req.playlist.PlayListID,
        updatedPlaylist = req.body;

        new Playlist({ PlayListID: id }).
          save(updatedPlaylist, { patch: true }).
          then(function(model) {
            res.json(200, model);
          }, function(err) {
            res.json(404, {error: "No such playlist", details: err});
          });

  },


}
