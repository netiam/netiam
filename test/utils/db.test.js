import _ from 'lodash'
import async from 'async'
import mongoose from 'mongoose'

function connect() {
  return mongoose.connect('mongodb://localhost:27017/netiam-list-test')
}

function disconnect() {
  mongoose.connection.close()
}

let db = connect()
export default db

function dropDatabase(done) {
  db.connection.db.dropDatabase(() => {
    disconnect()
    db = connect()

    const schemes = []

    _.forEach(mongoose.connections[0].base.modelSchemas, (schema, key) => {
      schemes.push(next => {
        mongoose.model(key, schema).ensureIndexes(() => {
          return next()
        })
      })
    })

    async.parallel(schemes, done)
  })
}

export function setup(done) {
  dropDatabase(done)
}

export function teardown(done) {
  dropDatabase(done)
}
