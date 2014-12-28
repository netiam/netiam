'use strict';

var schema = require( './fixtures/acl.json' ),
    user   = require( './fixtures/user.json' ),
    filter = require( '../lib/filter' );

describe( 'netiam', function() {
    describe( 'acl', function() {
        it( 'should filter properties for role GUEST', function() {
            var props = filter.filter( schema, user, 'GUEST', 'R' );
            props.should.have.properties( {
                '_id':         '542c7591e9905400008188eb',
                'name':        'eliias',
                'description': 'Hey, ich bin der Hansen.'
            } );
        } );

        it( 'should filter properties for role USER', function() {
            var props = filter.filter( schema, user, 'USER', 'R' );
            props.should.have.properties( {
                '_id':         '542c7591e9905400008188eb',
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
        } );

        it( 'should filter properties for role OWNER', function() {
            var props = filter.filter( schema, user, 'OWNER', 'R' );
            props.should.have.properties( {
                '_id':         '542c7591e9905400008188eb',
                'name':        'eliias',
                'description': 'Hey, ich bin der Hansen.',
                'email':       'hannes@impossiblearts.com',
                'password':    '[&dXN%cGZ#pP3&j',
                'firstname':   'Hannes',
                'lastname':    'Moser',
                'location':    [
                    13.0406998,
                    47.822352
                ],
                'created':     '2014-10-01T21:43:45.705Z',
                'modified':    '2014-11-12T12:39:22.615Z'
            } );
        } );

        it( 'should filter properties for role MANAGER', function() {
            var props = filter.filter( schema, user, 'MANAGER', 'R' );
            props.should.have.properties( {
                '_id':         '542c7591e9905400008188eb',
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
        } );

        it( 'should filter properties for role ADMIN', function() {
            var props = filter.filter( schema, user, 'ADMIN', 'R' );
            props.should.have.properties( {
                '_id':         '542c7591e9905400008188eb',
                'name':        'eliias',
                'description': 'Hey, ich bin der Hansen.',
                'email':       'hannes@impossiblearts.com',
                'firstname':   'Hannes',
                'lastname':    'Moser',
                'location':    [
                    13.0406998,
                    47.822352
                ],
                'created':     '2014-10-01T21:43:45.705Z',
                'modified':    '2014-11-12T12:39:22.615Z'
            } );
        } );
    } );
} );
