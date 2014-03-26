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
      all: ['server.js', 'app/**/*.js', 'config/*.js']
    },

    shell: {
      clean: 'rm -rf ./node_modules && npm cache clean',
      update: 'npm install',
      updateProd: 'npm install --production',
      start: 'NODE_ENV=development ./node_modules/.bin/nodemon server.js',
      test: 'NODE_ENV=test ./node_modules/.bin/mocha --reporter spec test/test-*.js',
      startProd: 'NODE_ENV=production ./node_modules/.bin/nodemon server.js'
    },

    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          ignore: ['node_modules/**', 'public/**']
        }
      }
    },

    'node-inspector': {
      dev: {}
    },

    concurrent: {
      dev: {
        tasks: ['node-inspector', 'nodemon'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  // Lint things
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('clean', ['shell:clean']);
  grunt.registerTask('reload', ['shell:clean', 'shell:update']);
  grunt.registerTask('start', ['concurrent']);
  grunt.registerTask('startProd', ['shell:clean', 'shell:updateProd', 'jshint', 'shell:test', 'startProd']);


}
