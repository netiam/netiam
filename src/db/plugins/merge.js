import _ from 'lodash'

/**
 * Get db references
 * @param {Schema} schema
 * @return {Object}
 */
function dbrefs(schema) {
  let refs = {}

  _.forEach(schema.paths, (path, name) => {
    let caster = path.caster
    let opt = path.options

    if (caster && caster.options && caster.options.ref) {
      refs[name] = name
    } else if (opt && opt.ref) {
      refs[name] = name
    }
  })

  return refs
}

/**
 * Handle value
 * @param {Object} o
 * @param {String} key
 * @param {*} val
 * @param {Boolean} isRef
 */
function handleValue(o, key, val, isRef) {
  if (_.isArray(val) && isRef) {
    let copy = _.cloneDeep(val)
    copy.forEach(function(node, index) {
      handleValue(copy, index, node, true)
    })
    o[key] = copy
  } else if (_.isObject(val) && val._id && isRef) {
    o[key] = val._id
  } else if (_.isObject(val)) {
    o[key] = _.cloneDeep(val)
  } else {
    o[key] = val
  }
}

function merge(schema) {
  /**
   * Merge data into document
   * @param {Object} data
   * @return {Object} The modified document
   */
  schema.methods.merge = function(data) {
    let refs = dbrefs(schema)

    for (let i in data) {
      if (data.hasOwnProperty(i)) {
        // Detect populated fields (ObjectId cannot cast such objects)
        handleValue(this, i, data[i], refs[i] ? true : false)
      }
    }

    // Make it fluent
    return this
  }

}

export default merge
