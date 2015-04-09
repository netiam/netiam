import RESTError from '../lib/rest/error'

describe('error', function() {

  it('should create and return a RESTError object', function() {
    let err = new RESTError('test', 1, 'safe', 'data')

    err.should.have.property('message')
    err.should.have.property('code')
    err.should.have.property('status')
    err.should.have.property('data')

    err.message.should.eql('test')
    err.code.should.eql(1)
    err.status.should.eql('safe')
    err.data.should.eql('data')
  })

})
