//https://jestjs.io/docs/en/getting-started.html
const ScrapUtils = require('../bin/lib/utils/ScrapUtils.js');

test('', () => {
    expect(ScrapUtils.findLongestMatchingHost('abc', ['a', 'ab', 'abc'])).toBe('abc')
})