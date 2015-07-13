/*import filter from './../utils/filter'
import acl from '../../src/rest/acl'
import asserts from '../../src/rest/asserts'
import User from '../models/user'
import loader from '../../src/acl/loader/file'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'

const userAcl = loader({path: __dirname + '/../fixtures/acl.json'})
const userFixture = require('./../fixtures/user.json')
const testAcl = acl({
  collection: User,
  acl: userAcl
})

describe('ACL', function() {

  before(function(done) {
    fixtures(function(err) {
      if (err) {
        return done(err)
      }

      Role.find({}, function(err, docs) {
        if (err) {
          return done(err)
        }

        roles.set(docs)
        done()
      })
    })
  })

  describe('read', function() {
    it('should filter properties for role GUEST', function() {
      let props = filter(userFixture, testAcl, userFixture, roles.get('GUEST'), 'R')
      props.should.have.properties({
        'name': 'eliias',
        'description': 'Hey, ich bin der Hannes.'
      })
    })

    it('should filter properties for role USER', function() {
      let props = filter(userFixture, testAcl, userFixture, roles.get('USER'), 'R')
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
      const assert = asserts.owner('id')
      const userFixtureWithId = Object.assign(userFixture, {id: 'test1234'})
      let props = filter(userFixtureWithId, testAcl, userFixtureWithId, roles.get('USER'), 'R', assert)

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

    it('should filter properties for role MANAGER', function() {
      let props = filter(userFixture, testAcl, userFixture, 'MANAGER', 'R')
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
      let props = filter(userFixture, testAcl, userFixture, 'ADMIN', 'R')
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
*/
