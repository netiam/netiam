import api from '../../src/netiam'
import {hasMany, belongsTo} from '../../src/rest/resource'
import connection from '../../src/db/connection'

export default Object.freeze({
  users(router) {
    const User = connection.collections.user
    router.post(
      '/users',
      api()
        .rest({
          idField: 'name',
          collection: User
        })
        .json()
    )
    router.get(
      '/users',
      api()
        .rest({
          idField: 'name',
          collection: User
        })
        .json()
    )
    router.get(
      '/users/:id',
      api()
        .rest({
          idField: 'name',
          collection: User
        })
        .json()
    )
    router.patch(
      '/users/:id',
      api()
        .rest({
          idField: 'name',
          collection: User
        })
        .json()
    )
    router.delete(
      '/users/:id',
      api()
        .rest({
          idField: 'name',
          collection: User
        })
        .json()
    )
  }
})
