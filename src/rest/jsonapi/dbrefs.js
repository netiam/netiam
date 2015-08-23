import _ from 'lodash'

export default function dbrefs(collection) {
  const schema = collection.schema
  let refs = []

  _.forEach(schema.paths, (path, name) => {
    let caster = path.caster
    let opt = path.options

    if (caster && caster.options && caster.options.ref) {
      refs.push(name)
    } else if (opt && opt.ref) {
      refs.push(name)
    }
  })

  return refs
}
