export default function created(schema) {

  schema.pre('save', function(next) {
    if (!this.created) {
      this.created = new Date()
    }

    next()
  })

}
