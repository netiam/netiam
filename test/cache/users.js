import request from 'supertest'
import db,{teardown} from './../utils/db'
import routes from './../utils/routes'

export default function() {
  const user = require('./../fixtures/user.json')
  const app = require('./../utils/app')()

  before(() => {
    routes.cache(app)
  })

  after(teardown)

  it('should create a user', function(done) {
    request(app)
      .post('/users')
      .send(user)
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

        done()
      })
  })

  it('should get users', function(done) {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should
          .be.instanceOf(Array)
          .and.have.lengthOf(1)

        done()
      })
  })

  it('should get cached users', function(done) {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('Cache', /[a-z0-9]{32}/)
      .end(function(err, res) {
        if (err) {
          return done(err)
        }

        res.body.should
          .be.instanceOf(Array)
          .and.have.lengthOf(1)

        done()
      })
  })

}