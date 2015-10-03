import uuid from 'uuid'

const userId = uuid.v4()

export default [
  {
    'name': 'GUEST',
    'description': 'If not logged in, every user is a guest.'
  },
  {
    '_id': userId,
    'name': 'USER',
    'description': 'Every user inherits from this role.'
  },
  {
    'name': 'MANAGER',
    'description': 'Petsitters are like regular users, but they have their petsitting tools.',
    'parent': userId
  },
  {
    'name': 'OWNER',
    'description': 'SPECIAL: Owner role.'
  },
  {
    'name': 'ADMIN',
    'superuser': true,
    'description': 'System administrators.'
  }
]
