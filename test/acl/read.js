import filter from './../utils/filter'
import aclRest from '../../src/rest/acl'
import asserts from '../../src/rest/asserts'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'

const userFixture = require('./../fixtures/user.json')
const acl = aclRest({settings: require('../fixtures/user.acl')})

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
    let props = filter(userFixture, acl, userFixture, roles.get('GUEST'), 'R')
    props.should.have.properties({})
  })

  it('should filter properties for role USER', function() {
    let props = filter(userFixture, acl, userFixture, roles.get('USER'), 'R')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role USER who is also resource OWNER', function() {
    const assert = asserts.owner('id')
    const userFixtureWithId = Object.assign(userFixture, {id: 'test1234'})
    let props = filter(userFixtureWithId, acl, userFixtureWithId, roles.get('USER'), 'R', assert)

    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role MANAGER', function() {
    let props = filter(userFixture, acl, userFixture, 'MANAGER', 'R')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role ADMIN', function() {
    let props = filter(userFixture, acl, userFixture, 'ADMIN', 'R')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

}
