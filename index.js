/**
 * Module Dependencies
 */

var debug = require('debug')('duo-css-compat');
var Package = require('duo-package');
var fmt = require('util').format;
var join = require('path').join;
var main = require('duo-main');

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

  return function *component_compat(file, entry) {
    if ('css' != entry.type) return;
    if ('css' != file.type) return;

    var path = join(file.root, 'component.json');
    var dir = join(entry.root, 'components');
    var obj = json(path);
    var deps = obj.dependencies;
    var styles = obj.styles || [];
    var pkgs = [];

    // styles: [ ... ]
    var entrypoint = main(obj, 'css');
    var i = styles.indexOf(entrypoint);
    if (~i) styles.splice(i, 1);

    // Add styles
    for (var i = 0, style; style = styles[i++];) {
      debug('adding "style": @import "%s";', path);
      file.src = fmt('%s\n@import "/%s";', file.src, style);
    }

    // dependencies: { ... }
    // create packages
    for (var pkg in deps) {
      pkgs[pkgs.length] = Package(pkg, deps[pkg]).directory(dir);
    }

    // fetch the packages
    yield fetch(pkgs);

    // filter out non-css packages
    var paths = filter(pkgs);

    // Add imports
    for (var i = 0, path; path = paths[i++];) {
      debug('adding "dependency": @import "%s";', path);
      file.src = fmt('@import "%s";\n%s', path, file.src);
    }
  }
}

/**
 * Fetch the package
 *
 * @param {Array} pkgs
 * @return {Array}
 * @api private
 */

function fetch(pkgs) {
  return pkgs.map(function(pkg) {
    debug('%s: fetching', pkg.slug());
    return pkg.fetch();
  });
}

/**
 * Filter out non-css packages
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
 */

function json(path) {
  try {
    return JSON.parse(JSON.stringify(require(path)));
  } catch (e) {
    return {};
  }
}
