import acl from './acl'
import auth from './auth'
import cache from './cache'
import client from './client'
import data from './data'
import graph from './graph'
import json from './json'
import jsonapi from './jsonapi'
import map from './map'
import profile from './profile'
import render from './render'
import rest from './rest'
import state from './state'
import transform from './transform'

export default {
  acl,
  auth,
  cache,
  client,
  data,
  graph,
  json,
  jsonapi,
  map,
  profile,
  render,
  rest,
  state,
  transform,
  register(plugin, name) {
    this[name] = plugin
  }
}
