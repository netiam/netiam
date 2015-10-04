import connection from '../../src/db/connection'
import Graph from '../collections/graph'
import Node from '../collections/node'
import Project from '../collections/project'
import UserNode from '../collections/user-node'

export function setup(done) {
  connection.register(Graph)
  connection.register(Node)
  connection.register(Project)
  connection.register(UserNode)

  done()
}

export function teardown(done) {
  const adapters = connection.config.adapters || {}
  const promises = []

  Object
    .keys(adapters)
    .forEach(adapter => {
      if (adapters[adapter].teardown) {
        const promise = new Promise(resolve => {
          adapters[adapter].teardown(null, resolve)
        })
        promises.push(promise)
      }
    })

  Promise
    .all(promises)
    .then(() => done())
    .catch(done)
}
