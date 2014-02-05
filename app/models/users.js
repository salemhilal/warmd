var Bookshelf = require('bookshelf'),
    db = Bookshelf.DB;

console.log("oh look the db");
console.log(db);

var User = db.Model.extend({
  tableName: "Users"
});


