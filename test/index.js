/**
 * Module Dependencies
 */

var read = require('fs').readFileSync;
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
    var root = join(fixtures, 'old');
    var css = yield Duo(root)
      .entry('index.css')
      .use(compat())
      .run();

    assert(css == read(join(root, 'index.out.css'), 'utf8'));
  })

  it('should ignore duo-compatible syntax', function *() {
    var root = join(fixtures, 'new');
    var css = yield Duo(root)
      .entry('index.css')
      .use(compat())
      .run();

    assert(css == read(join(root, 'index.out.css'), 'utf8'));
  })

  it('should handle the in between state logo/rocket-fuel@0.2.0', function *() {
    var root = join(fixtures, 'both');
    var css = yield Duo(root)
      .entry('index.css')
      .use(compat())
      .run();

    assert(css == read(join(root, 'index.out.css'), 'utf8'));

  })

});
