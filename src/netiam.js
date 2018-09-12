import dbg from 'debug';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import forEach from 'lodash/forEach';

const debug = dbg('netiam:dispatcher');

export default function({ config = {}, plugins = {} } = {}) {
  const stack = [];

  config = Object.assign(
    {
      baseUrl: '/'
    },
    config
  );

  function normalizeError(err) {
    if (err && isFunction(err.toJSON)) {
      return err.toJSON();
    }

    return {
      message: err.message
    };
  }

  const dispatcher = async (req, res) => {
    try {
      req.config = config;
      for (let call of stack) {
        await call(req, res);
      }
    } catch (err) {
      if (err.nonce) {
        return;
      }
      debug(err);
      res.status(err.status || 500).json(normalizeError(err));
    }
  };

  function registerPlugin(plugin) {
    if (isFunction(plugin)) {
      return (...spec) => {
        stack.push(plugin(...spec));
        return dispatcher;
      };
    }

    if (isObject(plugin)) {
      const container = {};
      forEach(plugin, (name, key) => {
        container[key] = (...spec) => {
          stack.push(name(...spec));
          return dispatcher;
        };
      });

      return container;
    }

    throw new Error(`The provided plugin has invalid type "${typeof plugin}"`);
  }

  // plugins
  function plugin(name, plugin) {
    if (dispatcher.hasOwnProperty(name)) {
      throw new Error(`The plugin with name ${name} is already registered or would overwrite a builtin method.`);
    }
    Object.defineProperty(dispatcher, name, {
      value: registerPlugin(plugin)
    });
    return dispatcher;
  }

  Object.defineProperty(dispatcher, 'plugin', {
    value: plugin
  });

  forEach(plugins, (fn, name) => plugin(name, fn));

  return dispatcher;
}
