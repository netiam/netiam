import filter from './../utils/filter'
import aclRest from '../../src/rest/acl'
import asserts from '../../src/rest/asserts'
import roles from '../../src/rest/roles'

const userFixture = require('./../fixtures/user.json')
const acl = aclRest({settings: require('../fixtures/user.acl')})

export default function() {

  before(done => {
    Role
      .find({})
      .then(roles.set)
      .catch(done)
  })

  it('should filter properties for role GUEST', () => {
    let props = filter(userFixture, acl, userFixture, roles.get('GUEST'), 'R')
    props.should.have.properties({})
  })

  it('should filter properties for role USER', () => {
    let props = filter(userFixture, acl, userFixture, roles.get('USER'), 'R')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role USER who is also resource OWNER', () => {
    const assert = asserts.owner('id')
    const userFixtureWithId = Object.assign(userFixture, {id: 'test1234'})
    let props = filter(userFixtureWithId, acl, userFixtureWithId, roles.get('USER'), 'R', assert)

    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role MANAGER', () => {
    let props = filter(userFixture, acl, userFixture, 'MANAGER', 'R')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role ADMIN', () => {
    let props = filter(userFixture, acl, userFixture, 'ADMIN', 'R')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

}
