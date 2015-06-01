import jsonapi from './jsonapi'
import transform from './transform'

describe('plugins', function() {
  this.timeout(10000)
  jsonapi()
  transform()
})
