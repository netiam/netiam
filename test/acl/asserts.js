import acl from '../../src/rest/acl'
import roles from '../../src/rest/roles'
import asserts from '../../src/rest/asserts'
import User from '../models/user'

const userAcl = require('./../fixtures/acl.json')
const userFixture = require('./../fixtures/user.json')
const testAcl = acl({
  collection: User,
  list: userAcl
})

describe('ACL', function() {

  describe('asserts', function() {
    it('should deny user owns resource', function() {
      let assert = asserts.owner('email', 'box@xyz.com')
      assert(testAcl, userFixture, roles.get('USER')).should.eql([])
    })

    it('should check if user owns resource', function() {
      let assert = asserts.owner('email', 'hannes@impossiblearts.com')
      assert(testAcl, userFixture, roles.get('USER')).should.eql([
        'password',
        'created',
        'modified'
      ])
    })
  })

})
