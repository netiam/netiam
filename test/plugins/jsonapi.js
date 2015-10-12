import _ from 'lodash'
import request from 'supertest'
import roles from '../../src/rest/roles'
import app from '../utils/app'
import {
  setup,
  teardown
} from '../utils/db'
import api from '../../src/netiam'
import userFixture from '../fixtures/user.json'

export default function() {
  let userId

  before(done => {
    app.post(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .jsonapi.res({collection: User})
    )

    app.get(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .jsonapi.res({collection: User})
    )

    app.get(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .jsonapi.res({collection: User})
    )

    app.put(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .jsonapi.res({collection: User})
    )

    fixtures(err => {
      if (err) {
        return done(err)
      }

      Role.find({}, (err, docs) => {
        if (err) {
          return done(err)
        }

        roles.set(docs)
        done()
      })
    })
  })

  after(teardown)

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

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.not.have.property('included')

        res.body.links.should.be.an.Object()

        res.body.data.should.be.an.Object()
        res.body.data.should.have.property('id')
        res.body.data.should.have.property('type')
        res.body.data.should.have.property('attributes')
        res.body.data.should.have.property('relationships')

        userId = res.body.data.id

        done()
      })
  })

  it('should create a second user', function(done) {
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

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.not.have.property('included')

        res.body.links.should.be.an.Object()

        res.body.data.should.be.an.Object()
        res.body.data.should.have.property('id')
        res.body.data.should.have.property('type')
        res.body.data.should.have.property('attributes')
        res.body.data.should.have.property('relationships')

        userId = res.body.data.id

        done()
      })
  })

  it('should create a third user', function(done) {
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

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.not.have.property('included')

        res.body.links.should.be.an.Object()

        res.body.data.should.be.an.Object()
        res.body.data.should.have.property('id')
        res.body.data.should.have.property('type')
        res.body.data.should.have.property('attributes')
        res.body.data.should.have.property('relationships')

        userId = res.body.data.id

        done()
      })
  })

  it('should create a fourth user', function(done) {
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

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.not.have.property('included')

        res.body.links.should.be.an.Object()

        res.body.data.should.be.an.Object()
        res.body.data.should.have.property('id')
        res.body.data.should.have.property('type')
        res.body.data.should.have.property('attributes')
        res.body.data.should.have.property('relationships')

        userId = res.body.data.id

        done()
      })
  })

  it('should create a fifth user', function(done) {
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

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.not.have.property('included')

        res.body.links.should.be.an.Object()

        res.body.data.should.be.an.Object()
        res.body.data.should.have.property('id')
        res.body.data.should.have.property('type')
        res.body.data.should.have.property('attributes')
        res.body.data.should.have.property('relationships')

        userId = res.body.data.id

        done()
      })
  })

  it('should get users - default page', function(done) {
    request(app)
      .get('/users?itemsPerPage=1')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.not.have.property('included')

        res.body.links.should.be.an.Object()

        res.body.data.should.be.an.Array()
        res.body.data.should.have.length(1)
        res.body.data[0].should.have.property('id')
        res.body.data[0].should.have.property('type')
        res.body.data[0].should.have.property('attributes')
        res.body.data[0].should.have.property('relationships')

        done()
      })
  })

  it('should get users + expanded role - default page', function(done) {
    request(app)
      .get('/users?expand=role&itemsPerPage=1')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.have.property('included')

        res.body.links.should.be.an.Object()
        res.body.data.should.be.an.Array()
        res.body.data.should.have.length(1)
        res.body.data[0].should.have.property('id')
        res.body.data[0].should.have.property('type')
        res.body.data[0].should.have.property('attributes')
        res.body.data[0].should.have.property('relationships')

        res.body.included.should.be.an.Array()
        res.body.included.should.have.length(1)
        res.body.included[0].should.have.properties([
          'id',
          'type',
          'attributes'
        ])

        done()
      })
  })

  it('should get users + expanded role - page1', function(done) {
    request(app)
      .get('/users?expand=role&page=1&itemsPerPage=1')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.have.property('included')

        res.body.links.should.be.an.Object()
        res.body.links.should.have.properties([
          'self',
          'next',
          'last'
        ])
        res.body.links.should.not.have.properties(['prev', 'first'])

        res.body.data.should.be.an.Array()
        res.body.data.should.have.length(1)
        res.body.data[0].should.have.property('id')
        res.body.data[0].should.have.property('type')
        res.body.data[0].should.have.property('attributes')
        res.body.data[0].should.have.property('relationships')

        res.body.included.should.be.an.Array()
        res.body.included.should.have.length(1)
        res.body.included[0].should.have.properties([
          'id',
          'type',
          'attributes'
        ])

        done()
      })
  })

  it('should get users + expanded role - page2', function(done) {
    request(app)
      .get('/users?expand=role&page=2&itemsPerPage=1')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.have.property('included')

        res.body.links.should.be.an.Object()
        res.body.links.should.have.properties([
          'self',
          'first',
          'next',
          'last'
        ])
        res.body.links.should.not.have.properties(['prev'])

        res.body.data.should.be.an.Array()
        res.body.data.should.have.length(1)
        res.body.data[0].should.have.property('id')
        res.body.data[0].should.have.property('type')
        res.body.data[0].should.have.property('attributes')
        res.body.data[0].should.have.property('relationships')

        res.body.included.should.be.an.Array()
        res.body.included.should.have.length(1)
        res.body.included[0].should.have.properties([
          'id',
          'type',
          'attributes'
        ])

        done()
      })
  })

  it('should get users + expanded role - page3', function(done) {
    request(app)
      .get('/users?expand=role&page=3&itemsPerPage=1')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.have.property('included')

        res.body.links.should.be.an.Object()
        res.body.links.should.have.properties([
          'self',
          'first',
          'prev',
          'next',
          'last'
        ])

        res.body.data.should.be.an.Array()
        res.body.data.should.have.length(1)
        res.body.data[0].should.have.property('id')
        res.body.data[0].should.have.property('type')
        res.body.data[0].should.have.property('attributes')
        res.body.data[0].should.have.property('relationships')

        res.body.included.should.be.an.Array()
        res.body.included.should.have.length(1)
        res.body.included[0].should.have.properties([
          'id',
          'type',
          'attributes'
        ])

        done()
      })
  })

  it('should get users + expanded role - page4', function(done) {
    request(app)
      .get('/users?expand=role&page=4&itemsPerPage=1')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.have.property('included')

        res.body.links.should.be.an.Object()
        res.body.links.should.have.properties([
          'self',
          'first',
          'prev',
          'last'
        ])
        res.body.links.should.not.have.properties(['next'])

        res.body.data.should.be.an.Array()
        res.body.data.should.have.length(1)
        res.body.data[0].should.have.property('id')
        res.body.data[0].should.have.property('type')
        res.body.data[0].should.have.property('attributes')
        res.body.data[0].should.have.property('relationships')

        res.body.included.should.be.an.Array()
        res.body.included.should.have.length(1)
        res.body.included[0].should.have.properties([
          'id',
          'type',
          'attributes'
        ])

        done()
      })
  })

  it('should get a user', function(done) {
    request(app)
      .get('/users/' + userId + '?expand=role')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.have.property('included')

        res.body.links.should.be.an.Object()

        res.body.data.should.be.an.Object()
        res.body.data.should.have.property('id')
        res.body.data.should.have.property('type')
        res.body.data.should.have.property('attributes')
        res.body.data.should.have.property('relationships')

        res.body.included.should.be.an.Array()
        res.body.included[0].should.have.properties([
          'id',
          'type',
          'attributes'
        ])

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

        res.body.should.have.property('links')
        res.body.should.have.property('data')
        res.body.should.not.have.property('included')

        res.body.links.should.be.an.Object()

        res.body.data.should.be.an.Object()
        res.body.data.should.have.property('id')
        res.body.data.should.have.property('type')
        res.body.data.should.have.property('attributes')
        res.body.data.should.have.property('relationships')

        done()
      })
  })

}
