/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const bowerResolve = require('../dist/rollup-plugin-bower-resolve');

describe('bowerResolve', () => {
  let cwd;
  let tmpDir;

  beforeEach(() => {
    cwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  beforeEach(() => {
    tmpDir = tmp.dirSync({
      unsafeCleanup: true,
    });
  });

  afterEach(() => {
    tmpDir.removeCallback();
  });

  it('should resolve dependency path of direct dependency', (done) => {
    const test1 = path.join(__dirname, 'it', 'test1');

    process.chdir(test1);

    const plugin = bowerResolve();
    const promise = plugin.resolveId('underscore', './index.js');

    promise.then((dependencyPath) => {
      expect(dependencyPath).toBeDefined();
      expect(dependencyPath).toBe(path.join(test1, 'vendors', 'underscore', 'underscore.js'));
      done();
    });

    promise.catch((err) => {
      done.fail(err);
    });
  });

  it('should resolve dependency path of transitive dependency', (done) => {
    const test2 = path.join(__dirname, 'it', 'test2');

    process.chdir(test2);

    const plugin = bowerResolve();
    const promise = plugin.resolveId('underscore', './index.js');

    promise.then((dependencyPath) => {
      expect(dependencyPath).toBeDefined();
      expect(dependencyPath).toBe(path.join(test2, 'vendors', 'underscore', 'underscore.js'));
      done();
    });

    promise.catch((err) => {
      done.fail(err);
    });
  });

  it('should bundle file', (done) => {
    const test1Dir = path.join(__dirname, 'it', 'test1');
    process.chdir(test1Dir);

    const bundleOutput = path.join(tmpDir.name, 'bundle.js');
    const bundleInput = path.join(test1Dir, 'bundle.js');

    const rollupConfig = {
      entry: bundleInput,
      dest: bundleOutput,
      format: 'es',
      plugins: [
        bowerResolve(),
        commonjs(),
      ],
    };

    rollup.rollup(rollupConfig)
      .then((bundle) => bundle.write(rollupConfig))
      .then(() => {
        fs.readFile(bundleOutput, 'utf8', (err, data) => {
          if (err) {
            done.fail(err);
          }

          const content = data.toString();
          expect(content).toBeDefined();
          expect(content).toContain('_.VERSION');
          done();
        });
      });
  });
});
