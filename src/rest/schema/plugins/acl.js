import aclFilter from '../../acl'

export default function aclPlugin(schema, opts = {}) {
  const {settings} = opts

  if (!settings) {
    throw new Error('You must provide an ACL settings list as "settings" option')
  }

  const acl = aclFilter({settings: settings})

  schema.statics.filterByAcl = function(user, role, privilege = 'R', asserts = []) {
    return acl.resource(user, role, privilege, asserts)
  }

  schema.methods.filterByAcl = function(user, role, privilege = 'R', asserts = []) {
    return acl.filter(user, this, role, privilege, asserts)
  }

}
