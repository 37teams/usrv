const { expect, fail } = require('code')
const Lab = require('lab')
const { after, before, describe, it } = (exports.lab = Lab.script())

const Wreck = require('@hapi/wreck')
const usrv = require('../usrv-dev')

describe('usrv', () => {
  it('Starts non mesh service', async () => {
    const srvfile = config => {
      config.transport.mesh = 'none'
      config.transport.listen = 3000
    }

    const srv = function() {
      this.message('a:b', async msg => ({ ok: true }))
    }

    const instance = usrv(srv, srvfile)

    await instance.ready()

    const res = await Wreck.request('post', 'http://127.0.0.1:3000/act', {
      payload: { a: 'b' }
    })
    const body = await Wreck.read(res)
    const out = JSON.parse(body.toString())
    expect(out.ok).to.be.true()
    instance.close()
  })
})
