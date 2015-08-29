import request from 'supertest'
import Client from './../models/client'
import db,{tearDown} from './../utils/db.test.js'
import api from '../../src/netiam'

export default function() {

  const clientFixture = require('./../fixtures/client.json')
  const app = require('./../utils/app.test.js')()
  let clientId
  let clientKey

  before(() => {
    app.post(
      '/clients',
      api()
        .rest({collection: Client})
        .map.res({_id: 'id'})
        .jsonapi({collection: Client})
    )

    app.get(
      '/clients/:id',
      api()
        .client({collection: Client})
        .rest({collection: Client})
        .map.res({_id: 'id'})
        .jsonapi({collection: Client})
    )
  })

  after(tearDown)

  describe('client', function() {
    it('should create a client', function(done) {
      request(app)
        .post('/clients')
        .send(clientFixture)
        .set('Accept', 'application/json')
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          try {
            let response = JSON.parse(res.text)
            response.should.have.property('data')
            response.data.should.have.properties({
              key: 'BXqJjCNvro0AZvuO5ur8F1j3UPXxI4pf5RcSdXFs8m4AYe3NHFcwow6LW29dUCkz+XzSzTPZ+M2LSFymtFCVtQ==',
              secret: 'Gw6TIPGWpxx+IzHrDQXR/X+4OHxg2XfCbo7wlyjyJjFl94gJ2rgKP5BdJwOPcnwnUnSkM5rv7EFXQqnGDEhr6Q=='
            })
            clientId = response.data.id
            clientKey = response.data.key
          } catch (err) {
            return done(err)
          }

          done()
        })
    })

    it('should get a client', function(done) {
      request(app)
        .get('/clients/' + clientId)
        .set('Accept', 'application/json')
        .set('api-client-id', clientKey)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect('Api-Client-Id', clientKey)
        .end(function(err, res) {
          if (err) {
            return done(err)
          }

          try {
            let response = JSON.parse(res.text)
            response.should.have.property('data')
            response.data.should.have.properties(['key', 'secret'])
          } catch (err) {
            return done(err)
          }

          done()
        })
    })

    it('should not get a client', function(done) {
      request(app)
        .get('/clients/' + clientId)
        .set('Accept', 'application/json')
        .expect(400)
        .end(function(err) {
          if (err) {
            return done(err)
          }

          done()
        })
    })

  })
}
