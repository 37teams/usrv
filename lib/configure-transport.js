const _ = require('lodash')
const findIp = require('get-ip-address')

const { findDNS } = require('./dns-lookup')

module.exports = function configureTransport(instance, config) {
  function configureDivyMesh() {
    throw Error('divy transport not supported yet')
  }

  function configureSenecaMesh() {
    const discover = {
      guess: { active: false },
      custom: {
        active: true,
        find: findDNS(config.baseDNS)
      },
      multicast: { active: false },
      registry: { active: false }
    }

    instance.use(require('seneca-mesh'), {
      ..._.omit(config, ['provider', 'baseDNS']),
      ...{ discover }
    })
  }

  function configurePointToPoint() {
    if (_.isArray(config.listen)) {
      config.listen.forEach(l => instance.listen(l))
    } else {
      instance.listen(config.listen)
    }
  }

  const bindings = {
    divy: configureDivyMesh,
    seneca: configureSenecaMesh,
    none: configurePointToPoint
  }

  const fail = () => {
    throw Error('Invalid transport config - transport.mesh')
  }

  return (bindings[config.provider] || fail)()
}
