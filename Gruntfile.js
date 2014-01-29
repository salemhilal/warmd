module.exports = function(grunt) {

  // Load dependencies
  require('load-grunt-tasks')(grunt);

  // Project Config
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Linting
    jshint: {
      options: {
        curly: true,    // Must have optional braces
        eqeqeq: true,   // No type inference
        freeze: true,   // Don't overwrite native object prototypes
        indent: 2,      // Tab formatting
        newcap: true    // Capitalize names of constructors
      }
    }
  
  });

  // Lint things
  grunt.registerTask('lint', ['jshint']);


}
