import jsonapi from './jsonapi'
import merge from './merge'
import transform from './transform'

describe('plugins', function() {
  this.timeout(10000)
  jsonapi()
  merge()
  transform()
})
