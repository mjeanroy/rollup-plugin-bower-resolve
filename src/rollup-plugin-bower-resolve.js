/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2023 Mickael Jeanroy
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

import has from 'lodash.has';
import path from 'path';
import { bower } from './bower';

/**
 * Translate given value to an array:
 * - Returns original array if `value` is already an array.
 * - Otherwise, returns `[value]`.
 *
 * @param {*} value Value, may be an array or not.
 * @returns {array<*>} Original array or array containing value.
 */
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

/**
 * Create plugin instance.
 *
 * @param {Object} options Plugin options.
 * @return {Object} Plugin instance.
 */
export function rollupPluginbowerResolve(options) {
  const opts = options || {};
  const useModule = opts.module !== false;
  const useJsNext = opts.jsnext !== false;
  const override = opts.override || {};
  const skip = opts.skip ? toArray(opts.skip) : [];
  const list = bower.list({
    offline: opts.offline,
    cwd: opts.cwd,
  });

  return {
    resolveId(importee, importer) {
      // Entry module
      if (!importer) {
        return null;
      }

      if (skip.includes(importee)) {
        // Skip dependency
        return null;
      }

      const parts = importee.split(/[/\\]/);
      const id = parts.shift();

      return list.then((dependencies) => {
        if (!has(dependencies, id)) {
          return null;
        }

        const dependency = dependencies[id];
        if (dependency.missing) {
          throw new Error(`Dependency '${id}' is missing, did you run 'bower install'?`);
        }

        const dir = dependency.canonicalDir;

        // If a full path is specified, such as: `import 'underscore/dist/underscore.js';`
        if (parts.length > 0) {
          return path.join(dir, ...parts);
        }

        // Allow path to be overridden
        if (has(override, importee)) {
          return path.join(dir, override[importee]);
        }

        const meta = dependency.pkgMeta;

        let main;
        if (useModule && meta.module) {
          main = meta.module;
        } else if (useJsNext && meta['jsnext:main']) {
          main = meta['jsnext:main'];
        } else {
          main = meta.main;
        }

        if (!main) {
          throw new Error(
            `Dependency ${importee} does not specify any main entry, please use 'override' options to specify main file`,
          );
        }

        // If it is an array, find main file.
        if (Array.isArray(main)) {
          const jsFiles = main.filter((f) => {
            const extension = path.extname(f);
            return extension.toLowerCase() === '.js';
          });

          if (jsFiles.length === 0) {
            throw new Error(
              `Dependency ${importee} does not specify any js main, please use 'override' options to specify main file`,
            );
          } else if (jsFiles.length > 1) {
            throw new Error(
              `Dependency ${importee} specify multiple js main entries, please use 'override' options to specify main file`,
            );
          }

          return path.join(dir, jsFiles[0]);
        }

        return path.join(dir, main);
      });
    },
  };
}
