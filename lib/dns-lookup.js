const dns = require('dns')

function findDNS(hostname) {
  return (seneca, options, bases, next) => {
    dns.lookup(
      hostname,
      {
        all: true,
        family: 4
      },
      (err, addresses) => {
        let bases = []

        if (err) {
          throw new Error('dns lookup for base node failed')
        }

        if (Array.isArray(addresses)) {
          bases = addresses.map(address => {
            return address.address
          })
        } else {
          bases.push(addresses)
        }

        next(bases)
      }
    )
  }
}

module.exports = { findDNS }
