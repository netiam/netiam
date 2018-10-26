export function isObject(o) {
  return typeof o === 'object';
}

export function forEach(o, cb) {
  if (Array.isArray(o)) {
    return o.forEach(cb);
  }
  Object.keys(o).forEach((key) => cb(o[key], key));
}

export function isFunction(o) {
  return typeof o === 'function';
}
