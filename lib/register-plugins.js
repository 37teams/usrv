const Path = require('path')
const _ = require('lodash')

const requireRelativeTo = (path, relativeTo) => {
  if (relativeTo && path[0] === '.') {
    path = Path.join(relativeTo, path)
  }

  return require(path)
}

const normalizeDefinition = relativeTo => def => {
  const normalizeDefinition = { plugin: def, options: def.options || {} }

  if (_.isString(def)) {
    normalizeDefinition.plugin = requireRelativeTo(def, relativeTo)
  }

  if (_.isObject(def) && _.isString(def.plugin)) {
    normalizeDefinition.plugin = requireRelativeTo(def.plugin, relativeTo)
  }

  return normalizeDefinition
}

module.exports = function registerPlugins(
  container,
  definitions = [],
  relativeTo
) {
  const pathToPlugins = relativeTo || process.cwd()

  definitions.map(normalizeDefinition(pathToPlugins)).forEach(definition => {
    container.use(definition.plugin, definition.options)
  })
}
