module.exports = function(Bookshelf){

   Bookshelf.mysqlAuth = Bookshelf.initialize({
      client: 'mysql',
      connection: {
         host: 'sqlhost.domain.tld',
         user: 'sql_user',
         password: 'sql_user_passwd',
         database: 'sql_database',
         charset: 'UTF-8'
      }
      //, debug: true
   });
}
