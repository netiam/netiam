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

function load(collection) {
  waterline.loadCollection(collection)
}

// FIXME: workaround for waterline initialization routine
// FIXME: we must fetch collection instance via collection identity
export function getCollectionByIdentity(collection) {
  const identity = collection.prototype.identity.toLowerCase()
  if (!waterline.collections || !waterline.collections.hasOwnProperty(identity)) {
    throw new Error('ORM is not initialized!')
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
