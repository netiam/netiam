import auto from './auto'
import client from './client'
import json from './json'
import jsonapi from './jsonapi'
import transform from './transform'
import xlsx from './xlsx'

describe('Plugins', () => {
  describe('Auto', auto)
  describe('Client', client)
  describe('JSON', json)
  describe('JSONAPI', jsonapi)
  describe('Transform', transform)
  describe('XLSX', xlsx)
})
