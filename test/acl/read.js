import filter from './../utils/filter'
import acl from '../../src/rest/acl'
import roles from '../../src/rest/roles'
import asserts from '../../src/rest/asserts'
import User from '../models/user'
import loader from '../../src/acl/loader/file'

const userAcl = loader({path: __dirname + '/../fixtures/acl.json'})
const userFixture = require('./../fixtures/user.json')
const testAcl = acl({
  collection: User,
  list: userAcl
})

describe('ACL', function() {

  describe('read', function() {
    it('should filter properties for role GUEST', function() {
      let props = filter(testAcl, userFixture, roles.get('GUEST'), 'R')
      props.should.have.properties({
        'name': 'eliias',
        'description': 'Hey, ich bin der Hannes.'
      })
    })

    it('should filter properties for role USER', function() {
      let props = filter(testAcl, userFixture, roles.get('USER'), 'R')
      props.should.have.properties({
        'name': 'eliias',
        'description': 'Hey, ich bin der Hannes.',
        'email': 'hannes@impossiblearts.com',
        'firstname': 'Hannes',
        'lastname': 'Moser',
        'location': [
          13.0406998,
          47.822352
        ]
      })
    })

    it('should filter properties for role USER who is also resource OWNER', function() {
      let assert = asserts.owner('email', 'hannes@impossiblearts.com')
      let props = filter(testAcl, userFixture, roles.get('USER'), 'R', assert)

      props.should.have.properties({
        'name': 'eliias',
        'description': 'Hey, ich bin der Hannes.',
        'email': 'hannes@impossiblearts.com',
        'password': '[&dXN%cGZ#pP3&j',
        'firstname': 'Hannes',
        'lastname': 'Moser',
        'location': [
          13.0406998,
          47.822352
        ],
        'created': '2014-10-01T21:43:45.705Z',
        'modified': '2014-11-12T12:39:22.615Z'
      })
    })

    it('should filter properties for role MANAGER', function() {
      let props = filter(testAcl, userFixture, 'MANAGER', 'R')
      props.should.have.properties({
        'name': 'eliias',
        'description': 'Hey, ich bin der Hannes.',
        'email': 'hannes@impossiblearts.com',
        'firstname': 'Hannes',
        'lastname': 'Moser',
        'location': [
          13.0406998,
          47.822352
        ]
      })
    })

    it('should filter properties for role ADMIN', function() {
      let props = filter(testAcl, userFixture, 'ADMIN', 'R')
      props.should.have.properties({
        'name': 'eliias',
        'description': 'Hey, ich bin der Hannes.',
        'email': 'hannes@impossiblearts.com',
        'firstname': 'Hannes',
        'lastname': 'Moser',
        'location': [
          13.0406998,
          47.822352
        ],
        'created': '2014-10-01T21:43:45.705Z',
        'modified': '2014-11-12T12:39:22.615Z'
      })
    })
  })

})
