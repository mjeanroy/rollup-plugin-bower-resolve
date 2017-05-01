/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 Mickael Jeanroy
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

'use strict';

var _ = require('lodash');
var bower = require('bower');
var Q = require('q');

module.exports.list = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return execList(options);
};

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
  var config = { json: json, offline: offline, cwd: cwd };

  bower.commands.list(undefined, config).on('end', function (conf) {
    deferred.resolve(flatten(conf));
  }).on('error', function (error) {
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
  var dependencies = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  _.forEach(pkg.dependencies, function (dep, id) {
    if (!_.has(dependencies, id)) {
      // Store current dependency...
      dependencies[id] = dep;

      // ... and add transitive dependencies
      _.extend(dependencies, flatten(dep, dependencies));
    }
  });

  return dependencies;
}