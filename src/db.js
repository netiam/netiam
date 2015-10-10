import Waterline from 'waterline'

const waterline = new Waterline()
let _collections

function init(spec) {
  const {config} = Object.assign({}, spec)
  let state
  waterline.initialize(config, (err, ontology) => {
    state = new Promise((resolve, reject) => {
      if (err) {
        return reject(err)
      }
      _collections = ontology.collections
      resolve()
    })
  })
  return function(req, res, next) {
    state
      .then(() => next())
      .catch(next)
  }
}

function load(collection) {
  waterline.loadCollection(collection)
}

export default Object.freeze({
  get collections() {
    return _collections
  },
  init,
  load
})
