import asserts from '../../src/rest/asserts'
import roles from '../../src/rest/roles'
import aclRest from '../../src/rest/acl'
import connection from '../../src/db/connection'

const {Role} = connection.collections

const userFixture = require('./../fixtures/user.json')
const projectFixture = require('./../fixtures/project.json')
const acl = aclRest({settings: require('../fixtures/acl.js')})

export default function() {

  before(done => {
    Role
      .find({})
      .then(roles.set)
      .catch(done)
  })

  it('should check if user owns resource', () => {
    const assert = asserts.owner()
    const userFixtureWithId = new User(Object.assign(userFixture, {id: 'test1234'}))
    const projectFixtureWithOwner = new Project(Object.assign(projectFixture, {owner: userFixtureWithId}))

    assert(userFixtureWithId, acl, projectFixtureWithOwner).should.eql([])
  })

  it('should check if user does not own resource', () => {
    const assert = asserts.owner()
    const userFixtureWithId = new User(Object.assign(userFixture, {id: 'test1234'}))
    const userFixtureWithWrongId = new User(Object.assign(userFixture, {id: 'test12345'}))
    const projectFixtureWithOwner = new Project(Object.assign(projectFixture, {owner: userFixtureWithId}))

    assert(userFixtureWithWrongId, acl, projectFixtureWithOwner).should.eql([])
  })

}
