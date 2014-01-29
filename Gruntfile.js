module.exports = function(grunt) {

  // Load dependencies
  require('load-grunt-tasks')(grunt);

  // Project Config
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Linting
    jshint: {
      options: {
        node: true,     // We're using node. 
        unused: true,   // Let us know if we don't use vars
        curly: true,    // Must have optional braces
        eqeqeq: true,   // No type inference
        freeze: true,   // Don't overwrite native object prototypes
        indent: 2,      // Tab formatting
        newcap: true    // Capitalize names of constructors
      },
      all: ['server.js', 'app/**/*.js']
    }
  
  });

  // Lint things
  grunt.registerTask('lint', ['jshint']);


}
