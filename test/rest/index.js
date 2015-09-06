import manyToOne from './many-to-one'
import oneToMany from './one-to-many'
import statusCodes from './status-codes'
import standard from './standard'

describe('REST', () => {
  describe('One-To-Many', oneToMany)
  describe('Many-To-One', manyToOne)
  describe('Status Codes', statusCodes)
  describe('Basic', standard)
})
