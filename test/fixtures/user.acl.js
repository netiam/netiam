import project from './project.acl'

export default {
  'asserts': {
    'owner': '_id'
  },
  'resource': {
    'ALLOW': {
      'ADMIN': 'CRUD',
      'USER': 'R',
      'GUEST': 'CRUD'
    }
  },
  'fields': {
    '*': {
      'ALLOW': {
        'ADMIN': 'CRUD'
      }
    },
    'id': {
      'ALLOW': {
        'USER': 'R',
        'GUEST': 'R'
      }
    },
    'name': {
      'ALLOW': {
        'USER': 'R',
        'GUEST': 'CR'
      }
    },
    'description': {
      'ALLOW': {
        'USER': 'R',
        'GUEST': 'CR'
      }
    },
    'email': {
      'ALLOW': {
        'USER': 'RU',
        'MANAGER': 'RU',
        'GUEST': 'CR'
      }
    },
    'firstname': {
      'ALLOW': {
        'USER': 'R',
        'GUEST': 'CR'
      }
    },
    'lastname': {
      'ALLOW': {
        'USER': 'R',
        'GUEST': 'CR'
      }
    },
    'location': {
      'ALLOW': {
        'USER': 'R',
        'GUEST': 'CR'
      }
    },
    'password': {
      'ALLOW': {
        'USER': 'C',
        'MANAGER': 'C',
        'GUEST': 'C'
      }
    },
    'project': {
      'ALLOW': {
        'OWNER': 'R',
        'USER': 'R',
        'MANAGER': 'CR'
      },
      ref: project
    }
  }
}
