import _ from 'lodash'
import async from 'async'
import {Collection} from 'waterline'
import connection from './connection'

export default function collection(spec) {
  const hooks = Object.freeze({
    beforeValidate: [],
    afterValidate: [],
    beforeCreate: [],
    afterCreate: [],
    beforeUpdate: [],
    afterUpdate: [],
    beforeDestroy: [],
    afterDestroy: []
  })

  function plugin(plugin, opts = {}) {
    plugin.call(this, this.prototype.attributes, opts)
  }

  function before(hook, cb) {
    const hookName = _.camelCase('before ' + hook)
    if (!hooks.hasOwnProperty(hookName)) {
      throw new Error(`Invalid hook "${hook}"`)
    }
    if (!_.isFunction(cb)) {
      throw new Error('Argument is not a function')
    }
    hooks[hookName].push(cb)
  }

  function after(hook, cb) {
    const hookName = _.camelCase('after ' + hook)
    if (!hooks.hasOwnProperty(hookName)) {
      throw new Error(`Invalid hook "${hook}"`)
    }
    if (!_.isFunction(cb)) {
      throw new Error('Argument is not a function')
    }
    hooks[hookName].push(cb)
  }

  function registerLifecycleEvent(type, record, done) {
    if (hooks[type].length === 0) {
      return done()
    }
    async.each(hooks[type], (event, next) => {
      event.call(this, record, next)
    }, done)
  }

  // extend spec with lifecycle events
  spec = Object.assign({
    beforeValidate: registerLifecycleEvent.bind(null, 'beforeValidate'),
    afterValidate: registerLifecycleEvent.bind(null, 'afterValidate'),
    beforeCreate: registerLifecycleEvent.bind(null, 'beforeCreate'),
    afterCreate: registerLifecycleEvent.bind(null, 'afterCreate'),
    beforeUpdate: registerLifecycleEvent.bind(null, 'beforeUpdate'),
    afterUpdate: registerLifecycleEvent.bind(null, 'afterUpdate'),
    beforeDestroy: registerLifecycleEvent.bind(null, 'beforeDestroy'),
    afterDestroy: registerLifecycleEvent.bind(null, 'afterDestroy')
  }, spec)

  const waterlineCollection = Collection.extend(spec)

  // extend collection with plugin system
  waterlineCollection.before = before.bind(waterlineCollection)
  waterlineCollection.after = after.bind(waterlineCollection)
  waterlineCollection.plugin = plugin.bind(waterlineCollection)

  return waterlineCollection
}
