import aclRest from '../../src/rest/acl'
import roles from '../../src/rest/roles'

const acl = aclRest({settings: require('../fixtures/user.acl')})

export default function() {

  before(done => {
    Role
      .find({})
      .then(roles.set)
      .catch(done)
  })

  it('should do something', () => {
    const user = new User({
      email: 'hannes@impossiblearts.com',
      role: roles.get('USER'),
      project: new Project({name: 'Project Nr. 1'})
    })

    const data = acl.filter(user, user, roles.get('USER'), 'R')
    data.should.have.properties(['email', 'project', '_id'])

    const project = data.project
    project.should.have.properties(['_id'])
  })

}
