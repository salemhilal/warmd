var Bookshelf = require('bookshelf').DB;

var Prog = Bookshelf.Model.extend({

   tableName: "Programs"

   });

module.exports = Prog;
