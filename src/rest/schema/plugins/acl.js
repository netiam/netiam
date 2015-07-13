export default function aclPlugin(schema, opts = {}) {

  const {acl} = opts

  if (!acl) {
    throw new Error('You must provide an ACL object as "acl" option')
  }

  if (acl.isValid && acl.isValid()) {
    throw new Error('The acl object is invalid')
  }

  schema.methods.filterByAcl = function() {
    return acl.filter(this)
  }

}
