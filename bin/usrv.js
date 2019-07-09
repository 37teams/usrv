#!/usr/bin/env node

// Native
const path = require('path')
const { existsSync } = require('fs')

// Packages
const arg = require('minimist')
const chalk = require('chalk')
const logError = require('../lib/log-error')
const loadfile = require('../lib/loadfile')
const usrv = require('../usrv')
const pkg = require('../package.json')

// Did the user supply any options
const argv = require('minimist')(process.argv.slice(2))
const env = process.env.NODE_ENV

if (argv.help) {
  console.log(chalk`
  {bold.cyan usrv} - Service container for seneca microservices

  {bold USAGE}
      {bold $} {cyan usrv} --help
      {bold $} {cyan usrv} --version
      {bold $} {cyan usrv} [{underline entry_point.js}] [-c {underline srvfile_path}

  By default {cyan usrv} will look first for the {bold "main"} property in
  package.json and subsequently for {bold index.js} as the default {underline entry_point}.
  Specifying a srvfile path {bold --c} argument will cause usrv to use the file at that path
  relative to the root project directory (where you package.json file is).

  {bold OPTIONS}
      --help                              shows this help message
      -v, --version                       displays the current version of usrv
      -c, --config {underline srvfile_path}           specify a path to a srvfile relative to the root dir
  `)
  process.exit()
}

if (argv.version) {
  console.log(pkg.version)
  process.exit()
}

let srvfileName = 'srvfile'

if (
  env &&
  existsSync(path.resolve(process.cwd(), `${srvfileName}.${env.toLowerCase()}`))
) {
  srvfileName = `${srvfileName}.${env}`
}

const defaultSrvFilePath = path.resolve(process.cwd(), srvfileName)
const srvfilePath = argv.c || argv.config || defaultSrvFilePath

let file = argv._[0]
let srvPkg

if (!file) {
  try {
    srvPkg = require(path.resolve(process.cwd(), 'package.json'))
    file = srvPkg.main || 'index.js'
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      logError(
        `Could not read \`package.json\`: ${err.message}`,
        'invalid-package-json'
      )
      process.exit(1)
    }
  }
}

if (!file) {
  logError('Please supply a file!', 'path-missing')
  process.exit(1)
}

if (file[0] !== '/') {
  file = path.resolve(process.cwd(), file)
}

if (!existsSync(file)) {
  logError(
    `The file or directory "${path.basename(file)}" doesn't exist!`,
    'path-not-existent'
  )
  process.exit(1)
}

async function start() {
  const srv = await loadfile(file)
  const srvfile = existsSync(srvfilePath) ? await loadfile(srvfilePath) : c => c

  srv.meta = srvPkg

  const service = usrv(srv, srvfile)

  await service.ready()

  service.log.info('service is ready')
}

start()
