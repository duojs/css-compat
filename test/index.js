/**
 * Module Dependencies
 */

var readfile = require('fs').readFileSync;
var exists = require('fs').existsSync;
var join = require('path').join;
var assert = require('assert');
var compat = require('..');
var Duo = require('duo');

var write = require('fs').writeFileSync;

/**
 * Fixtures
 */

var fixtures = join(__dirname, 'fixtures');

/**
 * Tests
 */

describe('duo', function() {

  it('should load css deps', function *() {
    var css = yield duo('old').run();
    assert.equal(css, read('old/index.out.css'));
  })

  it('should ignore duo-compatible syntax', function *() {
    var css = yield duo('new').run();
    assert.equal(css, read('new/index.out.css'));
  })

  it('should handle the in between state of logo/rocket-fuel@0.2.1', function *() {
    var css = yield duo('both').run();
    assert.equal(css, read('both/index.out.css'));
  })

  it('should support loading only styles', function *() {
    var css = yield duo('styles').run();
    assert.equal(css, read('styles/index.out.css'));
  })

  it('should work with hybrids', function *() {
    var css = yield duo('hybrid').run();
    assert.equal(css, read('hybrid/index.out.css'));
  })

  it('should CSS deps that dont have a styles or main', function *() {
    var css = yield duo('suit-theme').run();
    var obj = require(path('suit-theme/components/duo.json'));

    // simple dep check
    // TODO: improve
    var fullpath = obj['index.css'].deps['suitcss/theme'];
    assert(obj[fullpath].deps['suitcss-suit@0.5.0:index.css'] == 'components/suitcss-suit@0.5.0/index.css');
    assert(obj[fullpath].deps['/lib/theme-map.css'] == 'components/suitcss-theme@0.1.0/lib/theme-map.css');
  })

});

/**
 * Path to `fixture`
 *
 * @param {String} fixture
 * @return {String}
 * @api private
 */

function path(fixture){
  return join.apply(null, [__dirname, 'fixtures'].concat(fixture.split('/')));
}

/**
 * Read the file
 *
 * @param {String} file
 * @return {String} str
 * @api private
 */

function read(file) {
  file = path(file);
  return readfile(file, 'utf8');
}

/**
 * Create a duo instance
 *
 * @param {String} fixture
 * @param {String} entry
 * @api private
 */

function duo(fixture, entry) {
  return Duo(path(fixture))
    .entry(entry || 'index.css')
    .use(compat());
}
