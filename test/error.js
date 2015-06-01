import RESTError from '../src/rest/error'
import * as errors from '../src/rest/error'

describe('error', function() {

  it('should create and return a RESTError object', function() {
    const err = new RESTError('test', 1, 'safe', 'data')

    err.should.have.property('message')
    err.should.have.property('code')
    err.should.have.property('status')
    err.should.have.property('data')

    err.message.should.eql('test')
    err.code.should.eql(1)
    err.status.should.eql('safe')
    err.data.should.eql('data')
  })

  describe('4xx', function() {
    it('should create badRequest error object', function() {
      const err = errors.badRequest('foo')

      err.should.have.property('code')
      err.code.should.eql(400)
    })

    it('should create unauthorized error object', function() {
      const err = errors.unauthorized('foo')

      err.should.have.property('code')
      err.code.should.eql(401)
    })

    it('should create forbidden error object', function() {
      const err = errors.forbidden('foo')

      err.should.have.property('code')
      err.code.should.eql(403)
    })

    it('should create notFound error object', function() {
      const err = errors.notFound('foo')

      err.should.have.property('code')
      err.code.should.eql(404)
    })

    it('should create methodNotAllowed error object', function() {
      const err = errors.methodNotAllowed('foo')

      err.should.have.property('code')
      err.code.should.eql(405)
    })
  })

  describe('5xx', function() {
    it('should create internalServerError error object', function() {
      const err = errors.internalServerError('foo')

      err.should.have.property('code')
      err.code.should.eql(500)
    })

    it('should create notImplemented error object', function() {
      const err = errors.notImplemnted('foo')

      err.should.have.property('code')
      err.code.should.eql(501)
    })
  })

})
