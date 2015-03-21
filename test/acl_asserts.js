'use strict';

var schema  = require( './fixtures/acl.json' ),
    user    = require( './fixtures/user.json' ),
    Acl     = require( '../lib/rest/acl' ),
    roles   = require( '../lib/rest/roles' ),
    asserts = require( '../lib/rest/asserts' ),
    acl;

acl = new Acl( schema );

describe( 'ACL', function() {

    describe( 'asserts', function() {
        it( 'should deny user owns resource', function() {
            var assert = asserts.owner( 'email', 'box@xyz.com' );
            assert( acl, user, roles.get( 'USER' ) ).should.eql( [] );
        } );

        it( 'should check if user owns resource', function() {
            var assert = asserts.owner( 'email', 'hannes@impossiblearts.com' );
            assert( acl, user, roles.get( 'USER' ) ).should.eql( [
                'password',
                'created',
                'modified'
            ] );
        } );
    } );

} );
