import dbg from 'debug'
import moment from 'moment'

const debug = dbg('netiam:rest:schema:plugins')

export default function created(collection, opts = {}) {
  const {createdField} = Object.assign({
    createdField: 'created'
  }, opts)

  collection[createdField] = {
    type: 'datetime',
    defaultsTo: () => {
      return moment().toDate()
    }
  }
}
