export default function type(schema, spec) {

  schema
    .virtual('type')
    .get(function() {
      return spec.name
    })

}
