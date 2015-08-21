export default function type(schema, spec) {

  schema.set('toObject', {virtuals: true})
  schema.set('toJSON', {virtuals: true})

  schema
    .virtual('type')
    .get(function() {
      return spec.name
    })

}
