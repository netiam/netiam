import filter from './../utils/filter'
import aclRest from '../../src/rest/acl'
import asserts from '../../src/rest/asserts'
import {
  setup,
  teardown
} from '../utils/db'
import db from '../../src/db'
import roles from '../../src/rest/roles'
import userFixture from '../fixtures/user.json'

const acl = aclRest({settings: require('../fixtures/user.acl')})

export default function() {

  before(done => {
    setup()
      .then(() => db.collections.role.find({}))
      .then(documents => {
        roles.set(documents)
        done()
      })
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
    const props = filter(userFixtureWithId, acl, userFixtureWithId, roles.get('USER'), 'R', assert)

    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role MANAGER', () => {
    const props = filter(userFixture, acl, userFixture, 'MANAGER', 'R')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role ADMIN', () => {
    const props = filter(userFixture, acl, userFixture, 'ADMIN', 'R')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

}
