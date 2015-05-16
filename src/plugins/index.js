import acl from './acl'
import auth from './auth'
import cache from './cache'
import data from './data'
import graph from './graph'
import json from './json'
import jsonapi from './jsonapi'
import login from './login'
import map from './map'
import profile from './profile'
import render from './render'
import rest from './rest'
import transform from './transform'

export default {
  acl,
  auth,
  cache,
  data,
  graph,
  json,
  jsonapi,
  login,
  map,
  profile,
  render,
  rest,
  transform,
  register(plugin, name) {
    this[name] = plugin
  }
}
