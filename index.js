/**
 * Module Dependencies
 */

var debug = require('debug')('duo-css-compat');
var Package = require('duo-package');
var fmt = require('util').format;
var join = require('path').join;
var main = require('duo-main');
var keys = Object.keys;

/**
 * Export `compat`
 */

module.exports = compat;

/**
 * Add "styles" compatibility
 *
 * @param {Object} opts
 * @return {Function}
 * @api public
 */

function compat(opts) {
  opts = opts || {};
  var visited = {};

  return function *component_compat(file, entry) {
    if ('css' != entry.type) return;
    if ('css' != file.type) return;

    var manifest = join(file.root, 'component.json');

    // only visit a manifest once
    if (visited[manifest]) return;
    visited[manifest] = true;

    var obj = json(manifest);
    var styles = obj.styles;
    var deps = obj.dependencies || {};

    // only trigger for "old" components
    // that have a "styles" attribute in
    // their component.json
    if (!styles || !styles.length) return;

    // This will get picked up already in duo
    if (1 == styles.length && !keys(deps)) return;

    // styles: [ ... ]
    var entrypoint = main(obj, 'css');
    var i = styles.indexOf(entrypoint);
    if (~i) styles.splice(i, 1);

    // Add the additional styles in, if there are any
    for (var i = 0, style; style = styles[i++];) {
      debug('%s: adding "%s" style', file.id, style);
      file.src = fmt('%s\n@import "/%s";', file.src, style);
    }

    // No need to continue if we don't have
    // any additional dependencies
    if (!keys(deps)) return;

    var dir = join(entry.root, 'components');
    var pkgs = [];

    // dependencies: { ... }
    // create packages for each dependency
    for (var pkg in deps) {
      pkgs[pkgs.length] = Package(pkg, deps[pkg]).directory(dir);
    }

    // fetch the packages
    yield fetch(file.id, pkgs);

    // filter out non-CSS packages
    var paths = filter(pkgs);

    // Add imports
    for (var i = 0, path; path = paths[i++];) {
      debug('%s: adding "%s" dependency', file.id, path);
      file.src = fmt('@import "%s";\n%s', path, file.src);
    }
  }
}

/**
 * Fetch the package
 *
 * @param {String} rel
 * @param {Array} pkgs
 * @return {Array}
 * @api private
 */

function fetch(rel, pkgs) {
  return pkgs.map(function(pkg) {
    debug('%s: fetching "%s"', rel, pkg.slug());
    return pkg.fetch();
  });
}

/**
 * Filter out non-css packages
 *
 * @param {Package} pkg
 * @return {String}
 * @api private
 */

function filter(pkgs) {
  return pkgs
    .map(function(pkg) {
      var obj = json(pkg.path('component.json'));
      var entry = main(obj, 'css');
      return entry && fmt('%s:%s', pkg.slug(), entry);
    })
    .filter(function(paths) {
      return paths;
    })
}

/**
 * Load JSON
 *
 * @param {String} path
 * @return {Object}
 * @api private
 */

function json(path) {
  try {
    return JSON.parse(JSON.stringify(require(path)));
  } catch (e) {
    return {};
  }
}
