import User from '../models/user'
import Project from '../models/project'
import acl from '../../src/rest/acl'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'

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

  describe('filter', function() {

    it('should do something', function() {
      const user = new User({
        email: 'hannes@impossiblearts.com',
        role: roles.get('USER'),
        project: new Project({name: 'Project Nr. 1'})
      })

      const data = user.filterByAcl(user, roles.get('USER'), 'R')
      data.should.have.properties(['email', 'project', '_id'])

      const project = data.project
      project.should.have.properties(['_id'])
    })

  })

})
