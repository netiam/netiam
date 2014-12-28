'use strict';

var schema  = require( './fixtures/acl.json' ),
    user    = require( './fixtures/user.json' ),
    Acl     = require( '../lib/rest/acl' ),
    filter  = require( '../lib/filter' ),
    roles   = require( '../lib/rest/roles' ),
    asserts = require( '../lib/rest/asserts' ),
    acl;

acl = new Acl( schema );

describe( 'netiam', function() {

    describe( 'ACL - UPDATE', function() {
        it( 'should filter properties for role GUEST', function() {
            var props = filter.filter( acl, user, roles.get( 'GUEST' ), 'U' );
            props.should.have.properties( {
                'name':        'eliias',
                'description': 'Hey, ich bin der Hansen.'
            } );
        } );

        it( 'should filter properties for role USER', function() {
            var props = filter.filter( acl, user, roles.get( 'USER' ), 'U' );
            props.should.have.properties( {
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

        it( 'should filter properties for role USER who is also resource OWNER', function() {
            var assert = asserts.owner( 'email', 'hannes@impossiblearts.com' ),
                props;
            props = filter.filter( acl, user, roles.get( 'USER' ), 'U', assert );
            props.should.have.properties( {
                'name':        'eliias',
                'description': 'Hey, ich bin der Hansen.',
                'email':       'hannes@impossiblearts.com',
                'password':    '[&dXN%cGZ#pP3&j',
                'firstname':   'Hannes',
                'lastname':    'Moser',
                'location':    [
                    13.0406998,
                    47.822352
                ]
            } );
        } );

        it( 'should filter properties for role MANAGER', function() {
            var props = filter.filter( acl, user, 'MANAGER', 'U' );
            props.should.have.properties( {
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
            var props = filter.filter( acl, user, 'ADMIN', 'U' );
            props.should.have.properties( {
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
