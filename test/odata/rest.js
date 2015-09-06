import request from 'supertest'
import db,{teardown} from './../utils/db.test.js'
import routes from './../utils/routes'

export default function() {
  const userFixture = require('./../fixtures/user.json')
  const app = require('./../utils/app.test.js')()

  before(() => {
    routes.users(app)
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

  it('should query a user with filter', function(done) {
    request(app)
      .get('/users?filter=email EQ \'' + userFixture.email + '\'')
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
        res.body[0].email.should.be.eql(userFixture.email)

        done()
      })
  })

}
