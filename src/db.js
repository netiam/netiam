import _ from 'lodash'
import Waterline from 'waterline'

const waterline = new Waterline()
let _config
let _state = Promise.reject()

function init(spec) {
  const {config = {}} = spec
  _state = new Promise((resolve, reject) => {
    waterline.initialize(config, err => {
      if (err) {
        return reject(err)
      }
      _config = config
      resolve()
    })
  })
  return function(req, res, next) {
    _state
      .then(() => next())
      .catch(next)
  }
}

function load(...collection) {
  collection.forEach(c => waterline.loadCollection(c))
}

// FIXME: workaround for waterline initialization routine
// FIXME: we must fetch collection instance via collection identity
export function getCollectionByIdentity(collection) {
  if (!collection) {
    return undefined
  }
  const identity = collection.prototype.identity.toLowerCase()
  if (!waterline.collections) {
    throw new Error('ORM is not initialized!')
  }
  if (!waterline.collections.hasOwnProperty(identity)) {
    return undefined
  }
  return waterline.collections[identity]
}

export default Object.freeze({
  get collections() {
    return waterline.collections
  },
  get config() {
    return _config
  },
  get connection() {
    return waterline
  },
  get state() {
    return _state
  },
  init,
  load
})
