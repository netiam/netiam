'use strict';

var q      = require( 'q' ),
    should = require( 'should' );

describe( 'Q', function() {
    describe( 'chain', function() {
        it( 'should sequentially process data', function( done ) {
            var result = q( 0 );
            result
                .then( function( val ) {
                    return val + 1;
                } )
                .then( function( val ) {
                    return val + 1;
                } )
                .done( function( val ) {
                    val.should.equal( 2 );
                    done();
                }, function( err ) {
                    done( err );
                } );
        } );

        it( 'should raise an error', function( done ) {
            var result = q( 0 );
            result
                .then( function( val ) {
                    return val + 1;
                } )
                .then( function() {
                    throw Error( 'Something went south' );
                } )
                .catch( function( err ) {
                    should.exist( err );
                } )
                .done( function() {
                    done();
                }, function( err ) {
                    done( err );
                } );
        } );
    } );
} );
