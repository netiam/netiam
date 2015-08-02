import redis from 'redis'
import redisCache from '../../src/cache/redis'

describe('Cache', function() {
  let cache

  before(function(done) {
    const client = redis.createClient()
    client.on('error', done)
    client.on('ready', done)

    cache = redisCache({client})

  })

  describe('redis', function() {
    it('should create cache entry', function(done) {
      cache.save('test_id', 'Hello, World!', done)
    })

    it('should verify that cache entry exists', function(done) {
      cache.has('test_id', function(err, val) {
        if (err) {
          return done(err)
        }

        val.should.eql(true)
        done()
      })
    })

    it('should load a cache entry', function(done) {
      cache.load('test_id', function(err, val) {
        if (err) {
          return done(err)
        }

        val.should.be.eql('Hello, World!')
        done()
      })
    })

  })

})
