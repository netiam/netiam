import api,{db} from '../../src/netiam'
import User from '../../src/db/collections/user'
import {hasMany, belongsTo} from '../../src/rest/resource'

export default Object.freeze({

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

  users(router) {
    router.post(
      '/users',
      api()
        .auth({collection: User})
        .acl.req({settings: require('../fixtures/user.acl')})
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
