const Code = require('@hapi/code')
const Lab = require('@hapi/lab')

const toCurrency = require('../../lib/tocurrency')

const { expect } = Code
const lab = exports.lab = Lab.script()

lab.experiment('toCurrency', () => {
  lab.test('return string as number', () => {
    const currency = toCurrency('12.99')
    expect(currency).to.equal(12.99)
  })
  lab.test('removes non digit characters', () => {
    const currency = toCurrency('£1,299.99')
    expect(currency).to.equal(1299.99)
  })
  lab.test('gracefully handles empty input', () => {
    const currency = toCurrency('')
    expect(currency).to.equal(null)
  })
  lab.test('gracefully handles undefined input', () => {
    const currency = toCurrency(undefined)
    expect(currency).to.equal(null)
  })
  lab.test('rounds to 2 decimal places', () => {
    const currency = toCurrency('199.344')
    expect(currency).to.equal(199.34)
  })
})
