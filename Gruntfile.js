module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';'
      },
      dist: {
        // the files to concatenate
        src: ['src/**/*.js'],
        // the location of the resulting JS file
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      options: {
        globals: {
        }
      }
    },
    jasmine: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/**/*.js',
        vendor: [
          "js/fabric.min.js"
        ]
      }
    }
  });

  // Loading plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat', 'jasmine']);
  grunt.registerTask('test', ['jshint', 'jasmine']);
};
