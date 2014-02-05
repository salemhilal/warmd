var Bookshelf = require('bookshelf').DB;

var User = Bookshelf.Model.extend({
  tableName: "Users"
});

module.exports = User
