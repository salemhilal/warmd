var Bookshelf = require('bookshelf').DB;

var Program = Bookshelf.Model.extend({

   tableName: "Programs"

   });

module.exports = Program;
