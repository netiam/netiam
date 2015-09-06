import client from './client'
import json from './json'
import jsonapi from './jsonapi'
import transform from './transform'

describe('Plugins', () => {
  describe('Client', client)
  describe('JSON', json)
  describe('JSONAPI', jsonapi)
  describe('Transform', transform)
})
