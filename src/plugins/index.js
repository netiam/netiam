import acl from './acl'
import auth from './auth'
import auto from './auto'
import cache from './cache'
import client from './client'
import data from './data'
import graph from './graph'
import json from './json'
import jsonapi from './jsonapi'
import map from './map'
import merge from './merge'
import profile from './profile'
import render from './render'
import rest from './rest'
import state from './state'
import transform from './transform'
import xlsx from './xlsx'

export default {
  acl,
  auth,
  auto,
  cache,
  client,
  data,
  graph,
  json,
  jsonapi,
  map,
  merge,
  profile,
  render,
  rest,
  state,
  transform,
  xlsx,
  register(plugin, name) {
    this[name] = plugin
  }
}
