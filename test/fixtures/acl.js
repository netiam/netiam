export default {
  'asserts': {
    'owner': '_id'
  },
  'resource': {
    'ALLOW': {
      'ADMIN': 'CRUD',
      'USER': 'R',
      'GUEST': 'R'
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
    'name': {
      'ALLOW': {
        'USER': 'RU',
        'GUEST': 'RU'
      }
    },
    'description': {
      'ALLOW': {
        'USER': 'RU',
        'GUEST': 'RU'
      }
    },
    'email': {
      'ALLOW': {
        'USER': 'RU',
        'MANAGER': 'RU'
      }
    },
    'password': {
      'ALLOW': {
        'OWNER': ''
      }
    },
    'firstname': {
      'ALLOW': {
        'USER': 'RU',
        'MANAGER': 'RU'
      }
    },
    'lastname': {
      'ALLOW': {
        'USER': 'RU',
        'MANAGER': 'RU'
      }
    },
    'location': {
      'ALLOW': {
        'USER': 'RU',
        'MANAGER': 'RU'
      }
    },
    'created': {
      'ALLOW': {
        'OWNER': 'R'
      }
    },
    'modified': {
      'ALLOW': {
        'OWNER': 'R'
      }
    }
  }
}
