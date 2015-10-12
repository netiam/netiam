import asserts from '../../src/rest/asserts'
import roles from '../../src/rest/roles'
import aclRest from '../../src/rest/acl'
import {
  setup,
  teardown
} from '../utils/db'
import db from '../../src/db'

const userFixture = require('./../fixtures/user.json')
const projectFixture = require('./../fixtures/project.json')
const acl = aclRest({settings: require('../fixtures/acl.js')})

export default function() {
  before(done => {
    setup()
      .then(() => {
        return db.collections.role.find({})
      })
      .then(documents => {
        roles.set(documents)
        done()
      })
      .catch(done)
  })

  it('should check if user owns resource', () => {
    const assert = asserts.owner()
    const userFixtureWithId = Object.assign(userFixture, {id: 'test1234'})
    const projectFixtureWithOwner = Object.assign(projectFixture, {owner: userFixtureWithId})

    assert(userFixtureWithId, acl, projectFixtureWithOwner).should.eql([])
  })

  it('should check if user does not own resource', () => {
    const assert = asserts.owner()
    const userFixtureWithId = Object.assign(userFixture, {id: 'test1234'})
    const userFixtureWithWrongId = Object.assign(userFixture, {id: 'test12345'})
    const projectFixtureWithOwner = Object.assign(projectFixture, {owner: userFixtureWithId})

    assert(userFixtureWithWrongId, acl, projectFixtureWithOwner).should.eql([])
  })

}
