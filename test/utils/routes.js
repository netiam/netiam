import api from '../../src/netiam'
import * as Resource from '../../src/rest/resource'
import storage from '../../src/cache/file'
import User from '../models/user'
import Project from '../models/project'
import nodesFixture from '../fixtures/nodes'

export default Object.freeze({

  users(router) {
    router.get(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    router.post(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    router.put(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    router.delete(
      '/users/:id',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )
  },

  aclUsers(router) {
    router.post(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/users/:id',
      api()
        .rest({collection: User})
        .acl.res({settings: require('../fixtures/user.acl')})
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/auth-users/:id',
      api()
        .auth({collection: User})
        .rest({collection: User})
        .acl.res({settings: require('../fixtures/user.acl')})
        .map.res({_id: 'id'})
        .json()
    )
  },

  projectsOneToMany(router) {
    router.post(
      '/projects',
      api()
        .rest({collection: Project})
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects/:project/users',
      api()
        .rest({
          collection: User,
          map: {'project': ':project'}
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects/:project/users/:id',
      api()
        .rest({
          collection: User,
          map: {'project': ':project'}
        })
        .map.res({_id: 'id'})
        .json()
    )
  },

  projectsManyToOne(router) {
    router.post(
      '/projects',
      api()
        .rest({collection: Project})
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects',
      api()
        .rest({collection: Project})
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects/:project/users',
      api()
        .rest({
          collection: Project,
          relationship: Resource.MANY_TO_ONE,
          relationshipField: 'users',
          relationshipCollection: User,
          map: {'_id': ':project'}
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects/:project/users/:id',
      api()
        .rest({
          collection: Project,
          relationship: Resource.MANY_TO_ONE,
          relationshipField: 'users',
          relationshipCollection: User,
          map: {'_id': ':project'}
        })
        .map.res({_id: 'id'})
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

  cache(router) {
    router.post(
      '/users',
      api()
        .rest({collection: User})
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/users',
      api()
        .cache.req({storage: storage({path: '.tmp/cache'})})
        .rest({collection: User})
        .map.res({_id: 'id'})
        .cache.res({storage: storage({path: '.tmp/cache'})})
        .json()
    )
  }

})
