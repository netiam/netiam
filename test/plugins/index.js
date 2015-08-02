import client from './client'
import jsonapi from './jsonapi'
import transform from './transform'

describe('Plugins', function() {
  client()
  jsonapi()
  transform()
})
