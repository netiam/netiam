import api,{db} from '../../src/netiam'
import storage from '../../src/cache/file'
import User from '../../src/db/collections/user'
import Client from '../../src/db/collections/client'
import {hasMany, belongsTo} from '../../src/rest/resource'
import nodesFixture from '../fixtures/nodes.json'

export default Object.freeze({

  auto(router) {
    router.get(
      '/auto-users',
      api()
        .rest({collection: User})
        .auto.res({jsonapi: {collection: User}})
    )
  },

  cache(router) {
    router.get(
      '/cache-users',
      api()
        .cache.req({storage: storage({path: '.tmp/cache'})})
        .rest({collection: User})
        .cache.res({storage: storage({path: '.tmp/cache'})})
        .json()
    )
  },

  clients(router) {
    router.post(
      '/clients',
      api()
        .rest({
          collection: Client,
          idField: 'key'
        })
        .json()
    )

    router.get(
      '/clients/:id',
      api()
        .client({collection: Client})
        .rest({
          collection: Client,
          idField: 'key'
        })
        .json()
    )
  },

  graph(router) {
    router.get(
      '/graph',
      api()
        .data({nodes: nodesFixture})
        .graph()
        .render()
    )
  },

  plain(router) {
    router.get(
      '/plain-users',
      api()
        .rest({
          collection: User,
          itemsPerPage: 1
        })
        .map.res({_id: 'id'})
        .json()
    )
    router.get(
      '/plain-users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )
  },

  resources(router) {
    router.delete(
      '/resource',
      api()
        .auth({collection: User})
        .acl.req({settings: require('../fixtures/resource.acl')})
        .data({})
        .acl.res({settings: require('../fixtures/resource.acl')})
        .json()
    )
  },

  typed(router) {
    router.get(
      '/typed-users',
      api()
        .auth({collection: User})
        .acl.req({settings: require('../fixtures/user.acl')})
        .rest({collection: User})
        .acl.res({settings: require('../fixtures/user.acl')})
        .json({collection: User})
    )
    router.put(
      '/typed-users/:id',
      api()
        .auth({collection: User})
        .acl.req({settings: require('../fixtures/user.acl')})
        .rest({collection: User})
        .acl.res({settings: require('../fixtures/user.acl')})
        .json({collection: User})
    )
  },

  users(router) {
    router.post(
      '/users',
      api()
        .rest({collection: User})
        .acl.res({settings: require('../fixtures/user.acl')})
        .json()
    )
    router.get(
      '/users',
      api()
        .auth({collection: User})
        .acl.req({settings: require('../fixtures/user.acl')})
        .rest({collection: User})
        .acl.res({settings: require('../fixtures/user.acl')})
        .json()
    )
    router.get(
      '/users/:id',
      api()
        .auth({collection: User})
        .acl.req({settings: require('../fixtures/user.acl')})
        .rest({collection: User})
        .acl.res({settings: require('../fixtures/user.acl')})
        .json()
    )
    router.put(
      '/users/:id',
      api()
        .auth({collection: User})
        .acl.req({settings: require('../fixtures/user.acl')})
        .rest({collection: User})
        .acl.res({settings: require('../fixtures/user.acl')})
        .json()
    )
    router.patch(
      '/users/:id',
      api()
        .auth({collection: User})
        .acl.req({settings: require('../fixtures/user.acl')})
        .rest({collection: User})
        .acl.res({settings: require('../fixtures/user.acl')})
        .json()
    )
    router.delete(
      '/users/:id',
      api()
        .auth({collection: User})
        .acl.req({settings: require('../fixtures/user.acl')})
        .rest({collection: User})
        .json()
    )
  }
})
