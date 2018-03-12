module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        options:{
          report: "min",//输出压缩率，可选的值有 false(不输出信息)，gzip
          mangle: true //不混淆变量名,现在vendor混淆变量名后出现bug
        },
        files: {
          'build/static/scripts/rem.js': ['.tmp/static/scripts/rem.js'],
          'build/static/scripts/bundle.build.js': ['.tmp/static/scripts/bundle.build.js'],
        }
      }
    },
		ngmin: {
			controllers: {
				src: ['.tmp/static/scripts/bundle.build.js'],
				dest: '.tmp/static/scripts/bundle.build.js'
			}
		},
    imagemin: {                          // Task
      dynamic: {                         // Another target
        options: {                       // Target options
          optimizationLevel: 3,
          svgoPlugins: [{ removeViewBox: false }],
          //use: [mozjpeg()]
        },
        files: [{
          expand: true,                  // Enable dynamic expansion
          cwd: '.tmp/static/images/',                   // Src matches are relative to this path
          src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
          dest: 'build/static/images'                  // Destination path prefix
        }]
      }
    },
    htmlmin: {                                     // Task
      dist: {                                      // Target
        options: {                                 // Target options
          removeComments: true,
          collapseWhitespace: true
        },
        /*
        files: {                                   // Dictionary of files
          'build/index.html': 'index.html',
          'build/static/views/*.html': '.tmp/static/views/*.html',
          {expand: true, cwd: 'dist/html', src: ['*.html'], dest: 'dist/html'}
        }
        */
        files: [{
          expand: true,
          cwd: '.tmp',
          src: '**/*.html',
          dest: 'build/'
        }]
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: [{
          expand: true,
          cwd: './.tmp/static/styles',
          src: ['cssreset-min.css', 'app.css'],
          dest: './build/static/styles',
          ext: '.css'
        }]
      }
    },
    copy: {
      main: {
        files: [
          // includes files within path
          //{expand: true, src: ['path/*'], dest: 'dest/', filter: 'isFile'},

          // includes files within path and its sub-directories
          {expand: true, src: ['static/**'], dest: '.tmp/'},
          {expand: true, src: ['*.html'], dest: '.tmp/'},

          // makes all src relative to cwd
          //{expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'},

          // flattens results to a single level
          //{expand: true, flatten: true, src: ['path/**'], dest: 'dest/', filter: 'isFile'},
        ],
      }
    }
  });

  // 加载包含任务的插件。
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-ngmin');

  // 默认被执行的任务列表。
  grunt.registerTask('default', ['copy', 'ngmin', 'uglify', 'cssmin', 'htmlmin', 'imagemin']);

};
