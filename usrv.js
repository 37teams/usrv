const Seneca = require('seneca')
const _ = require('lodash')
const registerPlugins = require('./lib/register-plugins')
const {
  createSrvConfig,
  createSrvOptionsTemplate
} = require('./lib/parse-configuration')
const configureTransport = require('./lib/configure-transport')

function Usrv(srv, srvfile) {
  if (!srv) {
    throw Error('no service found')
  }

  srv.meta = srv.meta || {}

  // can inject props if needed.
  const srvOptions = createSrvOptionsTemplate()
  srvfile(srvOptions)

  const config = createSrvConfig(srv, srvOptions)
  const instance = Seneca(config.runtime)

  registerPlugins(instance, config.plugins, config.relativeTo)

  instance.use(srv, config.srv)

  configureTransport(instance, config.mesh)

  return instance
}

module.exports = Usrv
