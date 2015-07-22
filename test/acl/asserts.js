import User from '../models/user'
import Project from '../models/project'
import asserts from '../../src/rest/asserts'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'
import aclRest from '../../src/rest/acl'

const userFixture = require('./../fixtures/user.json')
const projectFixture = require('./../fixtures/project.json')
const acl = aclRest({settings: require('../fixtures/acl.js')})

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

  describe('asserts', function() {

    it('should check if user owns resource', function() {
      const assert = asserts.owner('owner')
      const userFixtureWithId = new User(Object.assign(userFixture, {id: 'test1234'}))
      const projectFixtureWithOwner = new Project(Object.assign(projectFixture, {owner: userFixtureWithId}))

      assert(userFixtureWithId, acl, projectFixtureWithOwner).should.eql([])
    })

    it('should check if user does not own resource', function() {
      const assert = asserts.owner('owner')
      const userFixtureWithId = new User(Object.assign(userFixture, {id: 'test1234'}))
      const userFixtureWithWrongId = new User(Object.assign(userFixture, {id: 'test12345'}))
      const projectFixtureWithOwner = new Project(Object.assign(projectFixture, {owner: userFixtureWithId}))

      assert(userFixtureWithWrongId, acl, projectFixtureWithOwner).should.eql([])
    })

  })

})
