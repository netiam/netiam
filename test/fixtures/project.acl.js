export default {
  'resource': {
    'ALLOW': {
      'ADMIN': 'CRUD'
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
      }
    },
    'name': {
      'ALLOW': {
        'OWNER': 'RU',
        'MANAGER': 'RU'
      }
    }
  }
}
