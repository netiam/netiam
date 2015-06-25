import request from 'supertest'
import User from './../models/user'
import Node from './../models/node'
import UserNode from './../models/user-node'
import db from './../utils/db.test.js'
import api from '../../src/netiam'

export default function() {

  const userFixture = require('./../fixtures/user.json')
  const nodesFixture = require('./../fixtures/nodes.json')
  const userNodeFixture = require('./../fixtures/user-node.json')
  const app = require('./../utils/app.test.js')()
  let userId
  let nodeId

  before(function(done) {
    app.post(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    app.get(
      '/users',
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
        .json()
    )

    app.post(
      '/nodes',
      api()
        .rest({collection: Node})
        .map.res({_id: 'id'})
        .json()
    )

    app.get(
      '/nodes/:id',
      api()
        .rest({collection: Node})
        .map.res({_id: 'id'})
        .json()
    )

    app.post(
      '/user-nodes',
      api()
        .rest({collection: UserNode})
        .map.res({_id: 'id'})
        .json()
    )

    app.get(
      '/user-nodes',
      api()
        .rest({collection: Node})
        .merge({
          collection: UserNode,
          idField: 'node'
        })
        .map.res({_id: 'id'})
        .json()
    )

    app.get(
      '/user-nodes/:id',
      api()
        .rest({collection: Node})
        .merge({
          collection: UserNode,
          idField: 'node'
        })
        .map.res({_id: 'id'})
        .json()
    )

    db.connection.db.dropDatabase(function(err) {
      if (err) {
        return done(err)
      }
      done()
    })
  })

  after(function(done) {
    db.connection.db.dropDatabase(function(err) {
      if (err) {
        return done(err)
      }
      done()
    })
  })

  describe('merge', function() {
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

          res.body.should.have.properties({
            'name': 'eliias',
            'description': 'Hey, ich bin der Hannes.',
            'email': 'hannes@impossiblearts.com',
            'firstname': 'Hannes',
            'lastname': 'Moser',
            'location': [
              13.0406998,
              47.822352
            ]
          })
          userId = res.body.id

          done()
        })
    })

    it('should get a user', function(done) {
      request(app)
        .get('/users/' + userId)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          res.body.should.have.properties({
            'name': 'eliias',
            'description': 'Hey, ich bin der Hannes.',
            'email': 'hannes@impossiblearts.com',
            'firstname': 'Hannes',
            'lastname': 'Moser',
            'location': [
              13.0406998,
              47.822352
            ]
          })

          done()
        })
    })

    it('should create a node', function(done) {
      request(app)
        .post('/nodes')
        .send(nodesFixture[0])
        .set('Accept', 'application/json')
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          res.body.should.have.properties(['id', 'edges'])
          nodeId = res.body.id

          done()
        })
    })

    it('should create a user-node', function(done) {
      const userNode = Object.assign(userNodeFixture, {node: nodeId})

      request(app)
        .post('/user-nodes')
        .send(userNode)
        .set('Accept', 'application/json')
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          res.body.should.have.properties(['id', 'node', 'score'])

          done()
        })
    })

    it('should get a list of merged user-nodes', function(done) {
      request(app)
        .get('/user-nodes')
        .set('Accept', 'application/json')
        .expect(501)
        .end(function(err, res) {
          done()
        })
    })

    it('should get a merged user-node', function(done) {
      request(app)
        .get('/user-nodes/' + nodeId)
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          res.body.should.have.properties(['id', 'node', 'edges', 'score'])

          done()
        })
    })

  })
}
