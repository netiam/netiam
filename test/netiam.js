describe('netiam', function() {

  describe('version', function() {
    it('should return current library version', function() {
      let pkg = require('../package.json')

      pkg.version.should.be.exactly('0.0.1')
    })
  })
})
