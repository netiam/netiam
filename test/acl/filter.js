import User from '../models/user'
import Project from '../models/project'
import aclRest from '../../src/rest/acl'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'

const acl = aclRest({settings: require('../fixtures/user.acl')})

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

      const data = acl.filter(user, user, roles.get('USER'), 'R')
      data.should.have.properties(['email', 'project', '_id'])

      const project = data.project
      project.should.have.properties(['_id'])
    })

  })

})
