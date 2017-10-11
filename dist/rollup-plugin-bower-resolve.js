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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _ = require('lodash');
var path = require('path');
var bower = require('./bower');

module.exports = function (options) {
  var opts = options || {};
  var useModule = opts.module !== false;
  var useJsNext = opts.jsnext !== false;
  var override = opts.override || {};
  var skip = opts.skip ? _.castArray(opts.skip) : [];
  var list = bower.list(_.pick(opts, ['offline', 'cwd']));

  return {
    resolveId: function resolveId(importee, importer) {
      // Entry module
      if (!importer) {
        return null;
      }

      if (_.includes(skip, importee)) {
        // Skip dependency
        return null;
      }

      var parts = importee.split(/[\/\\]/);
      var id = parts.shift();

      return list.then(function (dependencies) {
        if (!_.has(dependencies, id)) {
          return null;
        }

        var dependency = dependencies[id];
        if (dependency.missing) {
          throw new Error('Dependency \'' + id + '\' is missing, did you run \'bower install\'?');
        }

        var dir = dependency.canonicalDir;

        // If a full path is specified, such as: `import 'underscore/dist/underscore.js';`
        if (parts.length > 0) {
          return path.join.apply(path, [dir].concat(_toConsumableArray(parts)));
        }

        // Allow path to be overridden
        if (_.has(override, importee)) {
          return path.join(dir, override[importee]);
        }

        var meta = dependency.pkgMeta;

        var main = void 0;
        if (useModule && meta.module) {
          main = meta.module;
        } else if (useJsNext && meta['jsnext:main']) {
          main = meta['jsnext:main'];
        } else {
          main = meta.main;
        }

        if (!main) {
          throw new Error('Dependency ' + importee + ' does not specify any main entry, please use \'override\' options to specify main file');
        }

        // If it is an array, find main file.
        if (_.isArray(main)) {
          var jsFiles = _.filter(main, function (f) {
            var extension = path.extname(f);
            return extension.toLowerCase() === '.js';
          });

          if (jsFiles.length === 0) {
            throw new Error('Dependency ' + importee + ' does not specify any js main, please use \'override\' options to specify main file');
          } else if (jsFiles.length > 1) {
            throw new Error('Dependency ' + importee + ' specify multiple js main entries, please use \'override\' options to specify main file');
          }

          return path.join(dir, jsFiles[0]);
        }

        return path.join(dir, main);
      });
    }
  };
};