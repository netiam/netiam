import _ from 'lodash'

export default function attributes(spec) {
  return _.omit(spec.data, spec.refs)
}
