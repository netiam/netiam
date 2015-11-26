import fileCache from '../../src/cache/file'

export default function() {
  const cache = fileCache({path: '.tmp/cache'})

  it('should create cache entry', done => {
    cache
      .save('test_id', 'Hello, World!')
      .then(done)
      .catch(done)
  })

  it('should verify that cache entry exists', done => {
    cache
      .has('test_id')
      .then(val => {
        val.should.eql(true)
        done()
      })
      .catch(done)
  })

  it('should verify that cache entry does not exist', done => {
    cache
      .has('does_not_exist')
      .then(val => {
        val.should.eql(false)
        done()
      })
      .catch(done)
  })

  it('should load a cache entry', done => {
    cache
      .load('test_id')
      .then(val => {
        val.should.be.eql('Hello, World!')
        done()
      })
      .catch(done)
  })

}
