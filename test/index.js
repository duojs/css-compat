/**
 * Module Dependencies
 */

var readfile = require('fs').readFileSync;
var join = require('path').join;
var assert = require('assert');
var compat = require('..');
var Duo = require('duo');

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
    assert(css == read('old/index.out.css'));
  })

  it('should ignore duo-compatible syntax', function *() {
    var css = yield duo('new').run();
    assert(css == read('new/index.out.css'));
  })

  it('should handle the in between state of logo/rocket-fuel@0.2.0', function *() {
    var css = yield duo('both').run();
    assert(css == read('both/index.out.css'));
  })

  it('should support loading style', function *() {
    var css = yield duo('styles').run();
    assert(css == read('styles/index.out.css'));
  })

  it('should work with hybrids', function *() {
    var css = yield duo('hybrid').run();
    assert(css == read('hybrid/index.out.css'));
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
