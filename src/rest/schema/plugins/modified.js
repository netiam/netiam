export default function modified(schema) {

  schema.pre('save', function(next) {
    this.modified = new Date()

    next()
  })

}
