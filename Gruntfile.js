'use strict';

module.exports = function( grunt ) {

    require( 'time-grunt' )( grunt );
    require( 'load-grunt-tasks' )( grunt );

    grunt.initConfig( {
        pkg: grunt.file.readJSON( 'package.json' ),

        changelog: {
            sample: {
                options: {
                    dest:         'CHANGELOG.md',
                    template:     '{{date}}\n\n{{> features}}{{> fixes}}',
                    featureRegex: /^(.*)feature:?(.*)$/gim,
                    fixRegex:     /^(.*)fix:?(.*)$/gim
                }
            }
        },

        clean: {
            docs: ['docs/gen']
        },

        doxx: {
            all: {
                src:     './',
                target:  'docs/gen',
                options: {
                    title:    '<%= pkg.name %>',
                    ignore:   'Gruntfile.js,bin,docs,test,public,static,views,templates,node_modules',
                    template: 'docs/template.jade'
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

    grunt.registerTask( 'docs', ['clean:docs', 'doxx'] );
    grunt.registerTask( 'default', ['jshint'] );
    grunt.registerTask( 'release', [
        'clean',
        'jshint',
        'docs',
        'changelog',
        'bump'
    ] );

};
