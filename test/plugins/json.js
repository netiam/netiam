import _ from 'lodash'
import request from 'supertest'
import roles from '../../src/rest/roles'
import db from './../utils/db'
import api from '../../src/netiam'

export default function() {

  const userFixture = require('./../fixtures/user.json')
  const app = require('./../utils/app')()
  let userId

  before(function(done) {
    app.post(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json({collection: User})
    )

    app.get(
      '/users-plain',
      api()
        .rest({
          collection: User,
          itemsPerPage: 1
        })
        .map.res({_id: 'id'})
        .json()
    )

    app.get(
      '/users',
      api()
        .rest({
          collection: User,
          itemsPerPage: 1
        })
        .map.res({_id: 'id'})
        .json({collection: User})
    )

    app.get(
      '/users-plain/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    app.get(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json({collection: User})
    )

    app.put(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json({collection: User})
    )

    fixtures(function(err) {
      if (err) {
        return done(err)
      }

      Role.find({}, function(err, docs) {
        if (err) {
          return done(err)
        }

        roles.set(docs)
        done()
      })
    })
  })

  after(done => {
    db.connection.db.dropDatabase(err => {
      if (err) {
        return done(err)
      }
      done()
    })
  })

  it('should create a user', function(done) {
    request(app)
      .post('/users')
      .send(userFixture)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.have.property('user')
        res.body.user.should.be.an.Object()

        userId = res.body.user.id

        done()
      })
  })

  it('should get users - plain', function(done) {
    request(app)
      .get('/users-plain')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.be.an.Array()
        res.body.should.have.length(1)

        done()
      })
  })

  it('should get users - typed', function(done) {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.be.an.Object()
        res.body.should.have.property('user')
        res.body.user.should.be.an.Array()
        res.body.user.should.have.length(1)

        done()
      })
  })

  it('should get a user - plain', function(done) {
    request(app)
      .get('/users-plain/' + userId)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.be.an.Object()
        res.body.should.have.property('id')

        done()
      })
  })

  it('should modify a user', function(done) {
    let modifiedUser = _.clone(userFixture)
    modifiedUser.name = 'modified name'

    request(app)
      .put('/users/' + userId)
      .send(modifiedUser)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.be.an.Object()
        res.body.should.have.property('user')
        res.body.user.should.be.an.Object()
        res.body.user.should.have.property('id')

        done()
      })
  })

}
