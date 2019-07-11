const { expect, fail } = require('code')
const Lab = require('lab')
const { after, before, describe, it } = (exports.lab = Lab.script())

const Wreck = require('@hapi/wreck')
const usrv = require('../usrv')

describe('usrv', () => {
  it('Starts non mesh service', async () => {
    const srvfile = config => {
      config.mesh = 'none'
      config.listen = [{ pins: ['a:b'] }]
    }

    const srv = function s1() {
      this.message('a:b', async msg => ({ ok: true }))
    }

    await usrv(srv, srvfile, {})
  })
})
