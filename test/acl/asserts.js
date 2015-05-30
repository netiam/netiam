import path from 'path'
import User from '../models/user'
import acl from '../../src/rest/acl'
import asserts from '../../src/rest/asserts'
import loader from '../../src/acl/loader/file'
import fixtures from '../fixtures'
import roles from '../../src/rest/roles'
import Role from '../../src/rest/models/role'

const userAcl = loader({path: path.join(__dirname, '../fixtures/acl.json')})
const userFixture = require('./../fixtures/user.json')
const testAcl = acl({
  collection: User,
  acl: userAcl
})

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
      const assert = asserts.owner('id')
      const userFixtureWithId = Object.assign(userFixture, {id: 'test1234'})

      assert(userFixtureWithId, testAcl, userFixtureWithId, roles.get('USER')).should.eql([
        'created',
        'modified'
      ])
    })

  })

})
