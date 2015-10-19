import _ from 'lodash'

export default function dbrefs(collection) {
  const definition = collection.definition
  const refs = []

  _.forEach(definition, (path, name) => {
    const model = path.model

    if (model) {
      refs.push(name)
    }
  })

  return refs
}
