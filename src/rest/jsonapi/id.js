export default function id(spec) {
  if (spec.data && spec.data.constructor.name === 'ObjectID') {
    return spec.data.toString()
  }

  if (spec.data && spec.idField && spec.data[spec.idField]) {
    return typeof spec.data[spec.idField] === String
      ? spec.data[spec.idField]
      : spec.data[spec.idField].toString()
  }

  if (spec.data && spec.data.id) {
    return typeof spec.data.id === String
      ? spec.data.id
      : spec.data.id.toString()
  }

  if (spec.data && spec.data._id) {
    return typeof spec.data._id === String
      ? spec.data._id
      : spec.data._id.toString()
  }
}
