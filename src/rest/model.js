import _ from 'lodash'

export default function(schema) {

  if (!schema.get('created')) {
    schema.add({created: Date})
    schema.path('created').index(true)
  }
  if (!schema.get('modified')) {
    schema.add({modified: Date})
    schema.path('modified').index(true)
  }

  function refs() {
    const refs = []

    schema.eachPath(function(name, path) {
      let caster = path.caster
      let opt = path.options

      if (caster && caster._opts && caster._opts.ref) {
        refs.push(name)
      } else if (opt && opt.ref) {
        refs.push(name)
      }
    })

    return refs
  }

  /**
   * Handle value*
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
    } else if (_.isObject(val) && val.id && isRef) {
      o[key] = val.id
    } else if (_.isObject(val)) {
      o[key] = _.cloneDeep(val)
    } else {
      o[key] = val
    }
  }

  /**
   * Merge data into document
   * @param {Object} data
   * @return {Object} The modified document
   */
  schema.methods.merge = function(data) {
    let i
    let collectionRefs = refs(schema)

    for (i in data) {
      if (data.hasOwnProperty(i)) {
        // Detect populated fields (ObjectId cannot cast such objects)
        handleValue(this, i, data[i], collectionRefs[i] ? true : false)
      }
    }

    // Make it fluent
    return this
  }

  /**
   * Get refs from schema
   * @returns {Object} A list of paths
   */
  schema.statics.refs = refs

  // Hooks
  // http://github.com/LearnBoost/mongoose/issues/964
  schema.pre('save', function(next) {
    if (!this.created) {
      this.created = new Date()
    }
    this.modified = new Date()

    next()
  })

}
