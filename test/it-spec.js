/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2023 Mickael Jeanroy
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

import fs from 'fs/promises';
import path from 'path';
import tmp from 'tmp';
import * as rollup from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import bowerResolve from '../src/index';

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

  it('should resolve dependency path of direct dependency', async () => {
    const test1 = path.join(__dirname, 'it', 'test1');

    process.chdir(test1);

    const plugin = bowerResolve();
    const promise = plugin.resolveId('underscore', './index.js');

    await expectAsync(promise).toBeResolvedTo(
      path.join(test1, 'vendors', 'underscore', 'underscore.js'),
    );
  });

  it('should resolve dependency path of transitive dependency', async () => {
    const test2 = path.join(__dirname, 'it', 'test2');

    process.chdir(test2);

    const plugin = bowerResolve();
    const promise = plugin.resolveId('underscore', './index.js');

    await expectAsync(promise).toBeResolvedTo(
      path.join(test2, 'vendors', 'underscore', 'underscore.js'),
    );
  });

  it('should bundle file', async () => {
    const test1Dir = path.join(__dirname, 'it', 'test1');
    process.chdir(test1Dir);

    const bundleOutput = path.join(tmpDir.name, 'bundle.js');
    const bundleInput = path.join(test1Dir, 'bundle.js');

    const rollupConfig = {
      input: bundleInput,

      output: {
        file: bundleOutput,
        format: 'es',
      },

      plugins: [
        bowerResolve(),
        commonjs(),
      ],
    };

    const bundle = await rollup.rollup(rollupConfig);

    await bundle.write(rollupConfig.output);

    const data = await fs.readFile(bundleOutput, 'utf-8');
    const content = data.toString();
    expect(content).toBeDefined();
    expect(content).toContain('_.VERSION');
  });
});
