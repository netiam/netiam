import connection from '../../src/db/connection'

export default Object.freeze({
  setup(done) {
    done()
  },
  teardown(done) {
    const adapters = connection.config.adapters || {}
    const promises = []

    Object
      .keys(adapters)
      .forEach(adapter => {
        if (adapters[adapter].teardown) {
          const promise = new Promise(resolve => {
            adapters[adapter].teardown(null, resolve)
          })
          promises.push(promise)
        }
      })

    Promise
      .all(promises)
      .then(() => done())
      .catch(done)
  }
})
