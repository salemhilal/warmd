var Bookshelf = require('bookshelf').DB;

var Program = Bookshelf.Model.extend({

  tableName: "Programs"

});

exports.model = Program;
