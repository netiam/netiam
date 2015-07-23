import project from './project.acl'

export default {
  'asserts': {
    'owner': '_id'
  },
  'resource': {
    'ALLOW': {
      'ADMIN': "CRUD",
      'USER': "R",
      'GUEST': "R"
    }
  },
  'fields': {
    '*': {
      'ALLOW': {
        'ADMIN': 'CRUD'
      }
    },
    '_id': {
      'ALLOW': {
        'USER': 'R',
        'GUEST': 'R'
      },
      'DENY': {
        'GUEST': 'R'
      }
    },
    'email': {
      'ALLOW': {
        'USER': 'RU',
        'MANAGER': 'RU'
      }
    },
    'project': {
      'ALLOW': {
        'OWNER': 'R',
        'USER': 'R',
        'MANAGER': 'R'
      },
      ref: project
    }
  }
}
