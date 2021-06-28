const currency = require('currency.js')
function toCurrency (value) {
  const decimalString = value ? value.replace(/[^\d|.]+/g, '') : ''
  return decimalString === '' ? null : currency(value).value
}

module.exports = toCurrency
