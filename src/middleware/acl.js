import roles from '../rest/roles'

export default function acl(req, res, next) {
  roles.load(next)
}
