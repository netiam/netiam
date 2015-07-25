import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import fileCache from '../../src/cache/file'

describe('Cache', function() {

  before(function(done) {
    mkdirp('./tmp', done)
  })

  after(function(done) {
    rimraf('./tmp', done)
  })

  describe('file', function() {
    const cache = fileCache({path: './tmp'})

    it('should create cache entry', function(done) {
      cache
        .save('test_id', 'Hello, World!')
        .then(done)
        .catch(done)
    })

    it('should verify that cache entry exists', function(done) {
      cache
        .has('test_id')
        .then(function(val) {
          val.should.eql(true)
          done()
        })
        .catch(done)
    })

    it('should load a cache entry', function(done) {
      cache
        .load('test_id')
        .then(function(val) {
          val.should.be.eql('Hello, World!')
          done()
        })
        .catch(done)
    })

  })

})
