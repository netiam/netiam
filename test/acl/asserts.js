import Acl from '../../src/rest/acl'
import roles from '../../src/rest/roles'
import asserts from '../../src/rest/asserts'

let schema = require('./../fixtures/acl.json')
let user = require('./../fixtures/user.json')
let acl = new Acl(schema)

describe('ACL', function() {

  describe('asserts', function() {
    it('should deny user owns resource', function() {
      let assert = asserts.owner('email', 'box@xyz.com')
      assert(acl, user, roles.get('USER')).should.eql([])
    })

    it('should check if user owns resource', function() {
      let assert = asserts.owner('email', 'hannes@impossiblearts.com')
      assert(acl, user, roles.get('USER')).should.eql([
        'password',
        'created',
        'modified'
      ])
    })
  })

})