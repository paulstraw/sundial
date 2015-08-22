module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    sass:
      dist:
        options:
          style: 'compressed'
        files:
          'dist/css/sundial.css': 'src/scss/sundial.scss'
          'dist/css/sundial-theme-wizard-club.css': 'src/scss/sundial-theme-wizard-club.scss'

    postcss:
      options:
        processors: [
          require('autoprefixer-core')({browsers: 'last 2 versions'})
        ]
      dist:
        src: 'dist/css/*.css'

    coffee:
      dist:
        files:
          'dist/js/sundial.js': ['src/coffee/**/*.coffee']

    uglify:
      options:
        mangle: false
      dist:
        files:
          'dist/js/sundial.min.js': 'dist/js/sundial.js'

    notify:
      css:
        options:
          title: 'CSS Compiled'
          message: 'sass, postcss'
      js:
        options:
          title: 'JS Compiled'
          message: 'coffee, uglify'

    watch:
      css:
        files: 'src/**/*.scss'
        tasks: ['sass', 'postcss', 'notify:css']
        options:
          spawn: false
      js:
        files: 'src/**/*.coffee'
        tasks: ['coffee', 'uglify', 'notify:js']
        options:
          spawn: false

  require('load-grunt-tasks')(grunt)

  grunt.registerTask('default', ['sass', 'postcss', 'notify:css', 'coffee', 'uglify', 'notify:js'])
