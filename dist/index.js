/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

function _interopDefault(ex) {
  return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}

var castArray = _interopDefault(require("lodash.castarray"));
var pick = _interopDefault(require("lodash.pick"));
var includes = _interopDefault(require("lodash.includes"));
var has = _interopDefault(require("lodash.has"));
var isArray = _interopDefault(require("lodash.isarray"));
var filter = _interopDefault(require("lodash.filter"));
var path = _interopDefault(require("path"));
var forEach = _interopDefault(require("lodash.foreach"));
var assign = _interopDefault(require("lodash.assign"));
var _bower = _interopDefault(require("bower"));
var Q = _interopDefault(require("q"));

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  );
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
    return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError(
    "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}

/**
 * List all dependencies of a bower package.
 *
 * @param {Object} options Bower options.
 * @return {Promise<Object>} The promise of dependency object.
 */

function list() {
  var options =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return execList(options);
}
/**
 * List all dependencies of a bower package.
 *
 * @param {Object} options Bower options.
 * @return {Promise<Object>} The promise of dependency object.
 */

function execList(options) {
  var deferred = Q.defer();
  var json = options.json !== false;
  var offline = options.offline !== false;
  var cwd = options.cwd || process.cwd();
  var config = {
    json: json,
    offline: offline,
    cwd: cwd
  };

  _bower.commands
    .list(undefined, config)
    .on("end", function(conf) {
      deferred.resolve(flatten(conf));
    })
    .on("error", function(error) {
      deferred.reject(error);
    });

  return deferred.promise;
}
/**
 * Flatten dependency tree into a single dependency object:
 * - Object entry is the dependency name (i.e package name).
 * - Object value is the dependency metadata.
 *
 * @param {Object} pkg The package entrypoint.
 * @param {Object} dependencies Current dependencies (object populated and returned).
 * @return {Object} The dependencies.
 */

function flatten(pkg) {
  var dependencies =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  forEach(pkg.dependencies, function(dep, id) {
    if (!has(dependencies, id)) {
      // Store current dependency...
      dependencies[id] = dep; // ... and add transitive dependencies

      assign(dependencies, flatten(dep, dependencies));
    }
  });
  return dependencies;
}

var bower = {
  list: list
};

/**
 * Create plugin instance.
 *
 * @param {Object} options Plugin options.
 * @return {Object} Plugin instance.
 */

function rollupPluginbowerResolve(options) {
  var opts = options || {};
  var useModule = opts.module !== false;
  var useJsNext = opts.jsnext !== false;
  var override = opts.override || {};
  var skip = opts.skip ? castArray(opts.skip) : [];
  var list = bower.list(pick(opts, ["offline", "cwd"]));
  return {
    resolveId: function resolveId(importee, importer) {
      // Entry module
      if (!importer) {
        return null;
      }

      if (includes(skip, importee)) {
        // Skip dependency
        return null;
      }

      var parts = importee.split(/[/\\]/);
      var id = parts.shift();
      return list.then(function(dependencies) {
        if (!has(dependencies, id)) {
          return null;
        }

        var dependency = dependencies[id];

        if (dependency.missing) {
          throw new Error(
            "Dependency '".concat(
              id,
              "' is missing, did you run 'bower install'?"
            )
          );
        }

        var dir = dependency.canonicalDir; // If a full path is specified, such as: `import 'underscore/dist/underscore.js';`

        if (parts.length > 0) {
          return path.join.apply(path, [dir].concat(_toConsumableArray(parts)));
        } // Allow path to be overridden

        if (has(override, importee)) {
          return path.join(dir, override[importee]);
        }

        var meta = dependency.pkgMeta;
        var main;

        if (useModule && meta.module) {
          main = meta.module;
        } else if (useJsNext && meta["jsnext:main"]) {
          main = meta["jsnext:main"];
        } else {
          main = meta.main;
        }

        if (!main) {
          throw new Error(
            "Dependency ".concat(
              importee,
              " does not specify any main entry, please use 'override' options to specify main file"
            )
          );
        } // If it is an array, find main file.

        if (isArray(main)) {
          var jsFiles = filter(main, function(f) {
            var extension = path.extname(f);
            return extension.toLowerCase() === ".js";
          });

          if (jsFiles.length === 0) {
            throw new Error(
              "Dependency ".concat(
                importee,
                " does not specify any js main, please use 'override' options to specify main file"
              )
            );
          } else if (jsFiles.length > 1) {
            throw new Error(
              "Dependency ".concat(
                importee,
                " specify multiple js main entries, please use 'override' options to specify main file"
              )
            );
          }

          return path.join(dir, jsFiles[0]);
        }

        return path.join(dir, main);
      });
    }
  };
}

module.exports = rollupPluginbowerResolve;
