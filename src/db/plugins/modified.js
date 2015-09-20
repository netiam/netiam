import dbg from 'debug'
import moment from 'moment'

const debug = dbg('netiam:rest:schema:plugins')

export default function modified(collection, opts = {}) {
  const {modifiedField} = Object.assign({
    modifiedField: 'modified'
  }, opts)

  function save(values, next) {
    if (!values[modifiedField]) {
      return
    }

    values[modifiedField] = moment().toDate()
    next()
  }

  this.before('update', save)

  collection[modifiedField] = {
    type: 'datetime',
    defaultsTo: () => {
      return moment().toDate()
    }
  }
}
