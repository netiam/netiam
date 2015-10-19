import db from '../../src/db'
import roles from '../../src/rest/roles'
import rolesFixture from '../fixtures/roles'

export function setup(done) {
  if (db.config) {
    db.init({config: db.config})
  }

  const promise = db.state
    .then(() => {
      return db.collections.role.create(rolesFixture)
    })

  if (done) {
    return promise
      .then(() => done())
      .catch(done)
  }

  return promise
}

export function teardown(done) {
  const promise = new Promise((resolve, reject) => {
    db.connection.teardown(err => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })

  if (done) {
    return promise
      .then(() => done())
      .catch(done)
  }

  return promise
}
