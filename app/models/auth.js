var Bookshelf = require('bookshelf').DB;

module.exports = function() {
    var bookshelf = {};

    bookshelf.ApiUser = Bookshelf.Model.extend({
        tableName: 'Users'
    });

    return bookshelf;
}
