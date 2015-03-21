'use strict';

describe( 'cache', function() {
    var request = require( 'supertest' ),
        User = require( './models/user' ),
        user = require( './fixtures/user.json' ),
        app = require( './utils/app.test' )( {port: 3001} ),
        db = require( './utils/db.test' ),
        storage = require( '../lib/cache/file' ),
        netiam = require( '../index' )( app );

    this.timeout( 10000 );

    before( function( done ) {
        netiam
            .post( '/users' )
            .rest( {model: User} )
            .json();

        netiam
            .get( '/users' )
            .cache( {storage: storage( {path: '.tmp/cache'} )} )
            .rest( {model: User} )
            .json();

        db.connection.db.dropDatabase( function( err ) {
            if (err) {
                return done( err );
            }
            done();
        } );
    } );

    after( function( done ) {
        db.connection.db.dropDatabase( function( err ) {
            if (err) {
                return done( err );
            }
            done();
        } );
    } );

    describe( 'users', function() {
        it( 'should create a user', function( done ) {
            request( app )
                .post( '/users' )
                .send( user )
                .set( 'Accept', 'application/json' )
                .expect( 201 )
                .expect( 'Content-Type', /json/ )
                .end( function( err, res ) {
                    if (err) {
                        return done( err );
                    }

                    res.body.should.have.properties( {
                        'name':        'eliias',
                        'description': 'Hey, ich bin der Hansen.',
                        'email':       'hannes@impossiblearts.com',
                        'firstname':   'Hannes',
                        'lastname':    'Moser',
                        'location':    [
                            13.0406998,
                            47.822352
                        ]
                    } );

                    done();
                } );
        } );

        it( 'should get users', function( done ) {
            request( app )
                .get( '/users' )
                .set( 'Accept', 'application/json' )
                .expect( 200 )
                .expect( 'Content-Type', /json/ )
                .end( function( err, res ) {
                    if (err) {
                        return done( err );
                    }

                    res.body.should
                        .be.instanceOf( Array )
                        .and.have.lengthOf( 1 );

                    done();
                } );
        } );

        it( 'should get cached users', function( done ) {
            request( app )
                .get( '/users' )
                .set( 'Accept', 'application/json' )
                .expect( 200 )
                .expect( 'Content-Type', /json/ )
                .end( function( err, res ) {
                    if (err) {
                        return done( err );
                    }

                    res.body.should
                        .be.instanceOf( Array )
                        .and.have.lengthOf( 1 );

                    done();
                } );
        } );

    } );

} );
