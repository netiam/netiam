import netiam from '../src/netiam'

function plugin() {
  return function() {
    return Promise.resolve()
  }
}

describe('netiam', () => {
  describe('plugins', () => {

    it('should register plugin', done => {
      const api = netiam()
      api.plugin('test', plugin)
      api
        .test()
        .call(null, {}, {})
        .then(() => done())
        .catch(done)
    })

    it('should throw error on plugin registration', () => {
      const api = netiam()
      api.plugin('test', plugin);
      (function() {
        api.plugin('test', plugin)
      }).should.throw();

      (function() {
        api.plugin('plugin', plugin)
      }).should.throw()
    })

    it('add plugins at initialization time', done => {
      const plugins = {
        test: plugin
      }
      const api = netiam({plugins})
      api
        .test()
        .call(null, {}, {})
        .then(() => done())
        .catch(done)
    })

  })
})
