import db from '../../src/db'
import roles from '../../src/rest/roles'
import rolesFixture from '../fixtures/roles'

export function setup(done) {
  if (done) {
    db.state
      .then(() => {
        return db.collections.role.create(rolesFixture)
      })
      .then(() => done())
      .catch(done)
  }

  return db.state
    .then(() => {
      return db.collections.role.create(rolesFixture)
    })
}

export function teardown(done) {
  if (done) {
    db.connection.teardown(done)
  }
  return new Promise((resolve, reject) => {
    db.connection.teardown(err => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}
