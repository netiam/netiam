import file from './file'
import redis from './redis'
import users from './users'

describe('Cache', () => {
  describe('File', file)
  describe('Redis', redis)
  describe('Users', users)
})
