export function isObject(o) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

export function forEach(o, cb) {
  if (Array.isArray(o)) {
    return o.forEach(cb);
  }

  Object.keys(o).forEach((key) => cb(o[key], key));
}
