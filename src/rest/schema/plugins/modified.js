export default function modified(schema) {

  schema.add({modified: Date})

  schema.pre('save', function(next) {
    this.modified = new Date()

    next()
  })

}
