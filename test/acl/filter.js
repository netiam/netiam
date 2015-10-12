import aclRest from '../../src/rest/acl'
import roles from '../../src/rest/roles'
import Role from '../../src/db/collections/role'
import {
  setup,
  teardown
} from '../utils/db'
import db from '../../src/db'

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

  it('should apply filter', () => {
    const user = {
      email: 'hannes@impossiblearts.com',
      role: roles.get('USER'),
      project: {name: 'Project Nr. 1'}
    }

    const data = acl.filter(user, user, roles.get('USER'), 'R')
    data.should.have.properties(['email', 'project'])

    const project = data.project
    project.should.have.properties(['name'])
  })

}
