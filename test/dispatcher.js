import netiam from '../src/netiam'

function pluginA() {
  return function() {
    return Promise.resolve()
  }
}

function pluginB() {
  return function() {
    return Promise.resolve()
  }
}

describe('netiam', () => {
  describe('dispatcher', () => {
    it('should execute basic dispatcher', done => {
      const api = netiam()
      api({}, {})
        .then(() => done())
        .catch(done)
    })

    it('should execute dispatch stack', done => {
      const api = netiam()
      api.plugin('a', pluginA)
      api.plugin('b', pluginB)
      api
        .a()
        .b()
        .call(null, {}, {})
        .then(() => done())
        .catch(done)
    })
  })
})
