import request from 'supertest'
import appMock from './utils/app'
import netiam from '../src/netiam'

function text() {
  return function(req, res) {
    res.send('Hello, World!')
  }
}

const app = appMock()
app.get(
  '/api',
  netiam()
    .plugin('text', text)
    .text()
)

describe('netiam', () => {
  describe('middleware', () => {
    it('should execute basic dispatch', done => {
      request(app)
        .get('/api')
        .set('Accept', 'text/plain')
        .expect(200)
        .expect('Content-Type', /text/)
        .expect(res => {
          res.text.should.eql('Hello, World!')
        })
        .end(done)
    })
  })
})
