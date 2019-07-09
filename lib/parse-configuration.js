const _ = require('lodash')
const findIp = require('get-ip-address')
const PinoLogAdapter = require('seneca-pino-adapter')

const {
  PROJECT_ID,
  SRV_NAME,

  // Transport
  TIMEOUT = 15000,
  HISTORY_ACTIVE = false,
  HISTORY_PRUNE_INTERVAL = 100,
  SNEEZE_SILENT = false,
  SWIM_INTERVAL = 500,
  SWIM_JOIN_TIMEOUT = 2777,
  SWIM_PING_TIMEOUT = 2444,
  SWIM_PING_REQUEST_TIMEOUT = 2333,

  // Mesh
  BASE_SERVICE_DNS = 'core-base.seneca-mesh.svc.cluster.local',
  MESH_JOIN_TIME = 2000,

  // logging
  ENABLE_PRETTY_PRINT = false,
  LOG_LEVEL = 'info'
} = process.env

function createSrvConfig(srv, opts) {
  const {
    name,
    tag,
    version,
    timeout,
    listen,
    blocks,
    plugins,
    relativeTo,
    mesh,
    ...unmapped
  } = opts

  const srvName = name || tag || srv.name
  const host = 'localhost' //findIp()

  return {
    project: {
      id: PROJECT_ID
    },

    runtime: {
      // Tag this service instance.
      tag: srvName,

      // Standard timeout applied to actions
      timeout: timeout || TIMEOUT,

      // Apply legacy flags to seneca
      legacy: {
        error: false,
        transport: false
      },

      internals: {
        logger: new PinoLogAdapter({
          config: {
            name: tag,
            level: LOG_LEVEL,
            prettyPrint: ENABLE_PRETTY_PRINT
          }
        })
      },
      history: {
        active: HISTORY_ACTIVE,
        prune: true,
        interval: HISTORY_PRUNE_INTERVAL
      }
    },

    mesh: Object.assign(
      {
        provider: mesh || 'seneca',
        baseDNS: BASE_SERVICE_DNS,
        base: false,
        host,
        jointime: MESH_JOIN_TIME,
        sneeze: {
          tag: PROJECT_ID,
          swim: {
            interval: SWIM_INTERVAL,
            joinTimeout: SWIM_JOIN_TIMEOUT,
            pingTimeout: SWIM_PING_TIMEOUT,
            pingReqTimeout: SWIM_PING_REQUEST_TIMEOUT
          }
        }
      },
      { listen }
    ),

    // Set service version. Defaults to service package.json
    version: version || srv.meta.version,

    // Provide transport configuration
    transport: Object.assign({}, { mesh: mesh || 'seneca' }, listen),

    // Configuration passed into service at initialization
    srv: opts.state || {},

    // Add plugins to your service
    plugins: ['seneca-promisify'].concat(plugins || []),

    // When adding local blocks, you can override what local blocks are relative to.
    relativeTo: relativeTo
  }
}

function createSrvOptionsTemplate() {
  return { transport: {}, plugins: [] }
}

module.exports = { createSrvConfig, createSrvOptionsTemplate }
