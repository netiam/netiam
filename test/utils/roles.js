import Role from '../../src/rest/models/role'
import rolesFixture from '../fixtures/roles'

let isCreated = false

export default function(cb) {
  if (isCreated) {
    return cb()
  }

  isCreated = true

  if (rolesFixture.length === 0) {
    return cb()
  }

  let tasks = {
    total: rolesFixture.length,
    done: 0
  }

  rolesFixture.forEach(function(role) {
    const doc = new Role(role)
    doc.save(function(err) {
      if (err) {
        return cb(err)
      }

      tasks.done += 1
      if (tasks.done === tasks.total) {
        cb()
      }
    })
  })

}
