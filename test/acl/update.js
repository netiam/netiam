import filter from './../utils/filter'
import aclRest from '../../src/rest/acl'
import asserts from '../../src/rest/asserts'
import {
  setup,
  teardown
} from '../utils/db'
import db from '../../src/db'
import roles from '../../src/rest/roles'

const userFixture = require('./../fixtures/user')
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
  after(teardown)

  it('should filter properties for role GUEST', () => {
    let props = filter(userFixture, acl, userFixture, roles.get('GUEST'), 'U')
    props.should.have.properties({})
  })

  it('should filter properties for role USER', () => {
    let props = filter(userFixture, acl, userFixture, roles.get('USER'), 'U')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role USER who is also resource OWNER', () => {
    const assert = asserts.owner('id')
    const userFixtureWithId = Object.assign(userFixture, {id: 'test1234'})
    let props = filter(userFixtureWithId, acl, userFixtureWithId, roles.get('USER'), 'U', assert)
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role MANAGER', () => {
    let props = filter(userFixture, acl, userFixture, 'MANAGER', 'U')
    props.should.have.properties({
      'email': 'hannes@impossiblearts.com'
    })
  })

  it('should filter properties for role ADMIN', () => {
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
