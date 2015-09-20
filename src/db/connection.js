import Waterline from 'waterline'
import dbg from 'debug'
import Client from './collections/client'
import Role from './collections/role'
import Token from './collections/token'
import User from './collections/user'

const debug = dbg('netiam:rest:connection')
const waterline = new Waterline()
let _collections = {}
let _config = {}

function initialize(config) {
  _config = config

  // auto register collections provided by library
  register(Client)
  register(Role)
  register(Token)
  register(User)

  return new Promise((resolve, reject) => {
    waterline.initialize(config, (err, ontology) => {
      if (err) {
        debug(err)
        return reject(err)
      }
      Object.assign(_collections, ontology.collections)
      resolve()
    })
  })
}

function register(collection) {
  waterline.loadCollection(collection)
}

export default Object.freeze({
  get collections() {
    return _collections
  },
  get config() {
    return _config
  },
  initialize,
  register
})
