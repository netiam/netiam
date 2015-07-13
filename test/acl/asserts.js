import User from '../models/user'
import asserts from '../../src/rest/asserts'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'
const userFixture = require('./../fixtures/user.json')
const projectFixture = require('./../fixtures/project.json')

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
      const userFixtureWithId = Object.assign(userFixture, {id: 'test1234'})
      const projectFixtureWithOwner = Object.assign(projectFixture, {owner: 'test1234'})

      assert(userFixtureWithId, projectFixtureWithOwner).should.eql(true)
    })

    it('should check if user does not own resource', function() {
      const assert = asserts.owner('owner')
      const userFixtureWithWrongId = Object.assign(userFixture, {id: 'test12345'})
      const projectFixtureWithOwner = Object.assign(projectFixture, {owner: 'test1234'})

      assert(userFixtureWithWrongId, projectFixtureWithOwner).should.eql(false)
    })

  })

})
