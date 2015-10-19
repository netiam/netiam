export default {
  'asserts': {},
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
    'name': {
      'ALLOW': {
        'USER': 'R',
        'MANAGER': 'R',
        'GUEST': 'R'
      }
    },
    'description': {
      'ALLOW': {
        'USER': 'R',
        'MANAGER': 'R',
        'GUEST': 'R'
      }
    }
  }
}
