import request from 'supertest'
import appMock from './utils/app'
import netiam from '../src/netiam'

function json() {
  return function(req, res) {
    res.json(req.config)
  }
}

const app = appMock()
app.get(
  '/api',
  netiam({config: {hello: 'world'}})
    .plugin('json', json)
    .json()
)

describe('netiam', () => {
  describe('middleware', () => {
    it('should passthrough the API config', done => {
      request(app)
        .get('/api')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          res.body.should.have.properties(['hello'])
          res.body.hello.should.eql('world')
        })
        .end(done)
    })
  })
})
