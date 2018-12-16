'use strict'

const Lab = require('lab')
const Code = require('code')
const Hapi = require('hapi')

let server

const { experiment, it, before } = (exports.lab = Lab.script())

experiment('hapi-dev-error falls back to json', () => {
  before(async () => {
    server = new Hapi.Server()

    // fake dev env, no process.env.NODE_ENV defined
    await server.register({
      plugin: require('../lib/index'),
      options: {
        showErrors: true,
        toTerminal: false
      }
    })

    const routeOptions = {
      path: '/error',
      method: 'GET',
      handler: () => {
        return new Error('Somethinng bad happened')
      }
    }

    server.route(routeOptions)
  })

  it('responds json with json accept header', async () => {
    const response = await server.inject({
      url: '/error',
      method: 'GET',
      headers: {
        accept: 'foobar json baz'
      }
    })
    const payload = response.payload

    Code.expect(response.statusCode).to.equal(500)
    Code.expect(payload).to.startWith('{')
  })

  it('responds json with curl user-agent', async () => {
    const response = await server.inject({
      url: '/error',
      method: 'GET',
      headers: {
        'user-agent': 'curl/0.0'
      }
    })
    const payload = response.payload

    Code.expect(response.statusCode).to.equal(500)
    Code.expect(payload).to.startWith('{')
  })
})
