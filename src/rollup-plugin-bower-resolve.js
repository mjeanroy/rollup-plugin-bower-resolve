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

const _ = require('underscore');
const path = require('path');
const bowerUtil = require('./bower-util');
const ensureArray = val => _.isArray(val) ? val : [val];

module.exports = options => {
  const opts = options || {};
  const override = opts.override || {};
  const skip = opts.skip ? ensureArray(opts.skip) : [];
  const list = bowerUtil.list();

  return {
    resolveId: (importee, importer) => {
      // Entry module
      if (!importer) {
        return null;
      }

      if (_.contains(skip, importee)) {
        // Skip dependency
        return null;
      }

      return list.then(dependencies => {
        if (!_.has(dependencies, importee)) {
          return null;
        }

        const dependency = dependencies[importee];
        if (dependency.missing) {
          throw new Error(`Dependency '${importee}' is missing, did you run 'bower install'?`);
        }

        const dir = dependency.canonicalDir;

        // Allow path to be overridden
        if (_.has(override, importee)) {
          return path.join(dir, override[importee]);
        }

        const meta = dependency.pkgMeta;
        const main = meta.main;
        if (!main) {
          throw new Error(
            `Dependency ${importee} does not specify any main entry, please use 'override' options to specify main file`
          );
        }

        // If it is an array, find main file.
        if (_.isArray(main)) {
          const jsFiles = _.filter(main, f => {
            const extension = path.extname(f);
            return extension.toLowerCase() === '.js';
          });

          if (jsFiles.length === 0) {
            throw new Error(
              `Dependency ${importee} does not specify any js main, please use 'override' options to specify main file`
            );
          } else if (jsFiles.length > 1) {
            throw new Error(
              `Dependency ${importee} specify multiple js main entries, please use 'override' options to specify main file`
            );
          }

          return path.join(dir, jsFiles[0]);
        }

        return path.join(dir, main);
      });
    }
  };
};
