import api from '../../src/netiam'
import {hasMany, belongsTo} from '../../src/rest/resource'
import storage from '../../src/cache/file'
import User from '../models/user'
import Project from '../models/project'
import nodesFixture from '../fixtures/nodes'

export default Object.freeze({

  auto(router) {
    router.post(
      '/users',
      api()
        .rest({collection: User})
        .auto.res({jsonapi: {collection: User}})
    )

    router.get(
      '/users',
      api()
        .rest({collection: User})
        .auto.res({jsonapi: {collection: User}})
    )
  },

  resources(router) {
    router.delete(
      '/resource',
      api()
        .auth({collection: User})
        .acl.req({settings: require('../fixtures/resource.acl')})
        .data({})
        .json()
    )
  },

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

    router.get(
      '/users-idParam/:user',
      api()
        .rest({
          idParam: 'user',
          collection: User
        })
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

    router.put(
      '/users-idParam/:user',
      api()
        .rest({
          idParam: 'user',
          collection: User
        })
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

    router.delete(
      '/users-idParam/:user',
      api()
        .rest({
          idParam: 'user',
          collection: User
        })
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

    router.post(
      '/projects/:project/users',
      api()
        .rest({
          idParam: 'project',
          collection: Project,
          relationship: hasMany(User, {field: 'users'})
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects/:project/users',
      api()
        .rest({
          idParam: 'project',
          collection: Project,
          relationship: hasMany(User, {field: 'users'})
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects/:project/users/:id',
      api()
        .rest({
          idParam: 'project',
          collection: Project,
          relationship: hasMany(User, {field: 'users'})
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects/:project/users-idParam/:user',
      api()
        .rest({
          idParam: 'project',
          collection: Project,
          relationship: hasMany(User, {
            field: 'users',
            idParam: 'user'
          })
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.put(
      '/projects/:project/users/:id',
      api()
        .rest({
          idParam: 'project',
          collection: Project,
          relationship: hasMany(User, {field: 'users'})
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.put(
      '/projects/:project/users-idParam/:user',
      api()
        .rest({
          idParam: 'project',
          collection: Project,
          relationship: hasMany(User, {
            field: 'users',
            idParam: 'user'
          })
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.delete(
      '/projects/:project/users/:id',
      api()
        .rest({
          idParam: 'project',
          collection: Project,
          relationship: hasMany(User, {field: 'users'})
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.delete(
      '/projects/:project/users-idParam/:user',
      api()
        .rest({
          idParam: 'project',
          collection: Project,
          relationship: hasMany(User, {
            field: 'users',
            idParam: 'user'
          })
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

    router.post(
      '/projects/:project/users',
      api()
        .rest({
          collection: User,
          relationship: belongsTo(Project, {
            field: 'project',
            idParam: 'project'
          })
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects/:project/users',
      api()
        .rest({
          collection: User,
          relationship: belongsTo(Project, {
            field: 'project',
            idParam: 'project'
          })
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects/:project/users/:id',
      api()
        .rest({
          collection: User,
          relationship: belongsTo(Project, {
            field: 'project',
            idParam: 'project'
          })
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.get(
      '/projects/:project/users-idParam/:user',
      api()
        .rest({
          idParam: 'user',
          collection: User,
          relationship: belongsTo(Project, {
            field: 'project',
            idParam: 'project'
          })
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.put(
      '/projects/:project/users/:id',
      api()
        .rest({
          collection: User,
          relationship: belongsTo(Project, {
            field: 'project',
            idParam: 'project'
          })
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.put(
      '/projects/:project/users-idParam/:user',
      api()
        .rest({
          idParam: 'user',
          collection: User,
          relationship: belongsTo(Project, {
            field: 'project',
            idParam: 'project'
          })
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.delete(
      '/projects/:project/users/:id',
      api()
        .rest({
          collection: User,
          relationship: belongsTo(Project, {
            field: 'project',
            idParam: 'project'
          })
        })
        .map.res({_id: 'id'})
        .json()
    )

    router.delete(
      '/projects/:project/users-idParam/:user',
      api()
        .rest({
          idParam: 'user',
          collection: User,
          relationship: belongsTo(Project, {
            field: 'project',
            idParam: 'project'
          })
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
