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

    describe( 'asserts', function() {
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
