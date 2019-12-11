module.exports = {
  'coverage-all': true,
  'coverage-exclude': 'test-harness',
  threshold: 90,
  reporter: ['console', 'lcov', 'html'],
  output: ['stdout', 'coverage/lcov.info', 'coverage/coverage.html'],
  verbose: true
}