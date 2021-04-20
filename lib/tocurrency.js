function toCurrency (value) {
  const decimalString = value ? value.replace(/[^\d|.]+/g, '') : ''
  return decimalString === '' ? null : Math.round((Number(decimalString) + Number.EPSILON) * 100) / 100
}

module.exports = toCurrency
