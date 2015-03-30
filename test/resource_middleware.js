import _ from 'lodash'
import request from 'supertest'

describe( 'resource - middleware', function() {
  let User = require( './models/user' )
  let user = require( './fixtures/user.json' )
  let app = require( './utils/app.test' )( {port: 3001} )
  let db = require( './utils/db.test' )
  let netiam = require( '../lib/netiam' )( app )
  let userId

  this.timeout( 10000 )

  before( function( done ) {
    app.post(
      '/users',
      netiam
        .middleware()
        .rest( {model: User} )
        .json()
    )

    app.get(
      '/users',
      netiam
        .middleware()
        .rest( {model: User} )
        .json()
    )

    app.get(
      '/users/:id',
      netiam
        .middleware()
        .rest( {model: User} )
        .json()
    )

    app.put(
      '/users/:id',
      netiam
        .middleware()
        .rest( {model: User} )
        .json()
    )

    app.delete(
      '/users/:id',
      netiam
        .middleware()
        .rest( {model: User} )
        .json()
    )

    db.connection.db.dropDatabase( function( err ) {
      if (err) {
        return done( err )
      }
      done()
    } )
  } )

  after( function( done ) {
    db.connection.db.dropDatabase( function( err ) {
      if (err) {
        return done( err )
      }
      done()
    } )
  } )

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
            return done( err )
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
          } )

          userId = res.body._id

          done()
        } )
    } )

    it( 'should get users', function( done ) {
      request( app )
        .get( '/users' )
        .set( 'Accept', 'application/json' )
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function( err, res ) {
          if (err) {
            return done( err )
          }

          res.body.should
            .be.instanceOf( Array )
            .and.have.lengthOf( 1 )

          done()
        } )
    } )

    it( 'should get a user', function( done ) {
      request( app )
        .get( '/users/' + userId )
        .set( 'Accept', 'application/json' )
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function( err, res ) {
          if (err) {
            return done( err )
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
          } )

          done()
        } )
    } )

    it( 'should modify a user', function( done ) {
      let modifiedUser = _.clone( user )
      modifiedUser.name = 'modified name'

      request( app )
        .put( '/users/' + userId )
        .send( modifiedUser )
        .set( 'Accept', 'application/json' )
        .expect( 200 )
        .expect( 'Content-Type', /json/ )
        .end( function( err, res ) {
          if (err) {
            return done( err )
          }

          res.body.should.have.properties( {
            'name':        'modified name',
            'description': 'Hey, ich bin der Hansen.',
            'email':       'hannes@impossiblearts.com',
            'firstname':   'Hannes',
            'lastname':    'Moser',
            'location':    [
              13.0406998,
              47.822352
            ]
          } )

          done()
        } )
    } )

    it( 'should delete a user', function( done ) {
      request( app )
        .delete( '/users/' + userId )
        .set( 'Accept', 'application/json' )
        .expect( 204 )
        .end( function( err, res ) {
          if (err) {
            return done( err )
          }

          done()
        } )
    } )

  } )

} )
