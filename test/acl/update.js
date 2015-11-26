import filter from './../utils/filter'
import aclRest from '../../src/rest/acl'
import asserts from '../../src/rest/asserts'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'
import aclUser from '../fixtures/user.acl'
import userFixture from './../fixtures/user.json'

const acl = aclRest({settings: aclUser})

export default function() {

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

  it('should filter properties for role GUEST', function() {
    let props = filter(userFixture, acl, userFixture, roles.get('GUEST'), 'U')
    props.should.have.properties({})
  })

  it('should filter properties for role USER', function() {
    let props = filter(userFixture, acl, userFixture, roles.get('USER'), 'U')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role USER who is also resource OWNER', function() {
    const assert = asserts.owner('id')
    const userFixtureWithId = Object.assign(userFixture, {id: 'test1234'})
    let props = filter(userFixtureWithId, acl, userFixtureWithId, roles.get('USER'), 'U', assert)
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role MANAGER', function() {
    let props = filter(userFixture, acl, userFixture, 'MANAGER', 'U')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role ADMIN', function() {
    let props = filter(userFixture, acl, userFixture, 'ADMIN', 'U')
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

}
