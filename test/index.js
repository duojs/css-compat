
/**
 * Module Dependencies
 */

var readfile = require('fs').readFileSync;
var netrc = require('node-netrc');
var join = require('path').join;
var assert = require('assert');
var compat = require('..');
var Duo = require('duo');

var auth = netrc('api.github.com') || { token: process.env.GH_TOKEN };
var token = auth.password || auth.token;

/**
 * Tests
 */

describe('duo', function() {
  it('should load css deps', function *() {
    var css = yield build('old').run();
    assert.equal(css.code, read('old/index.out.css'));
  });

  it('should ignore duo-compatible syntax', function *() {
    var css = yield build('new').run();
    assert.equal(css.code, read('new/index.out.css'));
  });

  it('should handle the in between state of logo/rocket-fuel@0.2.1', function *() {
    var css = yield build('both').run();
    assert.equal(css.code, read('both/index.out.css'));
  });

  it('should support loading only styles', function *() {
    var css = yield build('styles').run();
    assert.equal(css.code, read('styles/index.out.css'));
  });

  it('should work with hybrids', function *() {
    var css = yield build('hybrid').run();
    assert.equal(css.code, read('hybrid/index.out.css'));
  });

  it('should CSS deps that dont have a styles or main', function *() {
    var duo = build('suit-theme');
    yield duo.run();
    var cache = yield duo.getCache();
    var obj = yield cache.read();

    // simple dep check
    // TODO: improve
    var fullpath = obj['index.css'].deps['suitcss/theme'];
    assert.equal(obj[fullpath].deps['suitcss-suit@0.5.0:index.css'], 'components/suitcss-suit@0.5.0/index.css');
    assert.equal(obj[fullpath].deps['/lib/theme-map.css'], 'components/suitcss-theme@0.1.0/lib/theme-map.css');
  });
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

function build(fixture, entry) {
  return Duo(path(fixture))
    .token(token)
    .entry(entry || 'index.css')
    .use(compat());
}
