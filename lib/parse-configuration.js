const _ = require('lodash')
const PinoLogAdapter = require('seneca-pino-adapter')
const envs = require('./envs')

function compileConfiguration(srv, opts, pkg) {
  return {
    project: {
      id: envs.PROJECT_ID
    },

    runtime: {
      // Tag this service instance.
      tag: opts.name || opts.tag || srv.name,

      // Standard timeout applied to actions
      timeout: opts.timeout || envs.TIMEOUT,

      // Apply legacy flags to seneca
      legacy: {
        error: false,
        transport: false
      },

      internals: {
        logger: new PinoLogAdapter({
          config: {
            name: opts.name || opts.tag || srv.name,
            level: envs.LOG_LEVEL,
            prettyPrint: envs.ENABLE_PRETTY_PRINT
          }
        })
      }
    },

    listen: opts.listen,

    // Set service version. Defaults to service package.json
    version: opts.version || pkg.version,

    // Configuration passed into service at initialization
    srv: opts.state || {},

    // Add plugins to your service
    plugins: opts.plugins,

    // When adding local blocks, you can override what local blocks are relative to.
    relativeTo: opts.relativeTo
  }
}

function compileOptions(srvfile) {
  const opts = { transport: {}, plugins: [] }
  srvfile(opts)

  return opts
}

module.exports = { compileConfiguration, compileOptions }
