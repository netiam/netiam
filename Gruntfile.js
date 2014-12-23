'use strict';

module.exports = function( grunt ) {

    require( 'time-grunt' )( grunt );
    require( 'load-grunt-tasks' )( grunt );

    grunt.initConfig( {
        pkg: grunt.file.readJSON( 'package.json' ),

        changelog: {
            sample: {
                options: {
                    dest:         'CHANGELOG',
                    featureRegex: /^(.*)feature:?(.*)$/gim,
                    fixRegex:     /^(.*)fix:?(.*)$/gim
                }
            }
        },

        bump: {
            options: {
                files:              ['package.json'],
                updateConfigs:      [],
                commit:             true,
                commitMessage:      'Release v%VERSION%',
                commitFiles:        ['package.json'],
                createTag:          true,
                tagName:            'v%VERSION%',
                tagMessage:         'Version %VERSION%',
                push:               true,
                pushTo:             'origin master',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace:      false
            }
        },

        jshint: {
            options: {jshintrc: true},
            all:     [
                './Gruntfile.js',
                './lib/**/*.js'
            ]
        }
    } );

    grunt.registerTask( 'default', ['jshint'] );
    grunt.registerTask( 'release', ['jshint', 'changelog', 'bump'] );

};
