'use strict';

module.exports = function( grunt ) {

    require( 'time-grunt' )( grunt );
    require( 'load-grunt-tasks' )( grunt );

    grunt.initConfig( {
        pkg:    grunt.file.readJSON( 'package.json' ),

        // JSHint
        jshint: {
            options: {jshintrc: true},
            all:    [
                './Gruntfile.js',
                './lib/**/*.js'
            ]
        }
    } );

    grunt.registerTask( 'default', ['jshint'] );

};
