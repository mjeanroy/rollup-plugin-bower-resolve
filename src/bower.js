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

import _bower from 'bower';
import { hasOwn } from './hasOwn';

/**
 * List all dependencies of a bower package.
 *
 * @param {Object} options Bower options.
 * @return {Promise<Object>} The promise of dependency object.
 */
function list(options = {}) {
  return execList(options);
}

/**
 * List all dependencies of a bower package.
 *
 * @param {Object} options Bower options.
 * @return {Promise<Object>} The promise of dependency object.
 */
function execList(options) {
  return new Promise((resolve, reject) => {
    const json = options.json !== false;
    const offline = options.offline !== false;
    const cwd = options.cwd || process.cwd();
    const config = { json, offline, cwd };

    _bower.commands.list(undefined, config)
      .on('end', (conf) => {
        resolve(flatten(conf));
      })
      .on('error', (error) => {
        reject(error);
      });
  });
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
function flatten(pkg, dependencies = {}) {
  if (pkg && pkg.dependencies) {
    Object.keys(pkg.dependencies).forEach((id) => {
      const dep = pkg.dependencies[id];
      if (!hasOwn(dependencies, id)) {
        // Store current dependency...
        // eslint-disable-next-line no-param-reassign
        dependencies[id] = dep;

        // ... and add transitive dependencies
        Object.assign(dependencies, flatten(dep, dependencies));
      }
    });
  }

  return dependencies;
}

export const bower = {
  list,
};
