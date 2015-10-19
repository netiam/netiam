import request from 'supertest'
import app from '../utils/app'
import {
  setup,
  teardown
} from '../utils/db'
import db from '../../src/db'
import roles from '../../src/rest/roles'
import api from '../../src/netiam'
import clientFixture from '../fixtures/client.json'

export default function() {
  let clientKey

  before(done => {
    setup()
      .then(() => db.collections.role.find({}))
      .then(documents => {
        roles.set(documents)
        done()
      })
      .catch(done)
  })
  after(teardown)

  it('should create a client', done => {
    request(app)
      .post('/clients')
      .send(clientFixture)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should.have.properties({
          key: 'BXqJjCNvro0AZvuO5ur8F1j3UPXxI4pf5RcSdXFs8m4AYe3NHFcwow6LW29dUCkz+XzSzTPZ+M2LSFymtFCVtQ==',
          secret: 'Gw6TIPGWpxx+IzHrDQXR/X+4OHxg2XfCbo7wlyjyJjFl94gJ2rgKP5BdJwOPcnwnUnSkM5rv7EFXQqnGDEhr6Q=='
        })

        clientKey = res.body.key

        done()
      })
  })

  it('should get a client', done => {
    request(app)
      .get('/clients/' + clientKey)
      .set('Accept', 'application/json')
      .set('api-client-id', clientKey)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('Api-Client-Id', clientKey)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        res.body.should.have.properties(['key', 'secret'])

        done()
      })
  })

  it('should not get a client', done => {
    request(app)
      .get('/clients/' + clientKey)
      .set('Accept', 'application/json')
      .expect(400)
      .end(done)
  })

}
