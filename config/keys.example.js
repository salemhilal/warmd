module.exports = {
  // Create a new entry for every environment you'd use.
  // For example, development, production, testing, etc.
  development: {

    // Here's details for connecting to the MySQL DB.
    mysql: {
      host: "HOST_URL_HERE",
      user: "USERNAME_HERE",
      password: "PASSWORD_HERE",
      database: "DATABASE_HERE",
      charset: "CHARACTER_ENCODING_HERE"
    }
  },

  // Pre-configured for travis-ci
  test: {
    mysql: {
      host: "127.0.0.1",
      user: "travis",
      password: "",
      database: "warmd",
      charset: "utf8"
    }
  }
};
