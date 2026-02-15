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

import path from 'node:path';
import { bower } from '../src/bower';
import { rollupPluginbowerResolve } from '../src/rollup-plugin-bower-resolve';

describe('bowerResolve', () => {
  let underscore;

  beforeEach(() => {
    // eslint-disable-next-line global-require
    underscore = require('./fixtures/underscore-meta')();
  });

  it('should return null if importer is null', () => {
    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('underscore', null);
    expect(result).toBeNull();
  });

  it('should return a promise of bower dependency path', async () => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({ underscore })
    ));

    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(result).toBeDefined();
    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.js'),
    );
  });

  it('should return a promise with full path', async () => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({ underscore })
    ));

    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('underscore/dist/underscore.js', './app.js');

    expect(result).toBeDefined();
    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'dist', 'underscore.js'),
    );
  });

  it('should return a promise using bower online', async () => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({ underscore })
    ));

    const plugin = rollupPluginbowerResolve({
      offline: false,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(result).toBeDefined();
    expect(bower.list).toHaveBeenCalledWith({
      offline: false,
      cwd: undefined,
    });

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.js'),
    );
  });

  it('should return a promise using custom work directory', async () => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({ underscore })
    ));

    const cwd = '/tmp';
    const plugin = rollupPluginbowerResolve({ cwd });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.js'),
    );
  });

  it('should return a promise of bower dependency path with overridden main', async () => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({ underscore })
    ));

    const plugin = rollupPluginbowerResolve({
      override: {
        underscore: './dist/underscore.js',
      },
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'dist', 'underscore.js'),
    );
  });

  it('should return a promise of bower dependency path with module entry by default', async () => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta.module = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve();

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.m.js'),
    );
  });

  it('should return a promise of bower dependency path with module entry', async () => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta.module = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve({
      module: true,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.m.js'),
    );
  });

  it('should return a promise of bower dependency path with main entry if `module` is false', async () => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta.module = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve({
      module: false,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.js'),
    );
  });

  it('should return a promise of bower dependency path with jsnext entry if enabled', async () => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta['jsnext:main'] = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve({
      jsnext: true,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.m.js'),
    );
  });

  it('should return a promise of bower dependency path without jsnext entry if disabled', async () => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta['jsnext:main'] = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve({
      jsnext: false,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.js'),
    );
  });

  it('should return a promise of bower dependency path with jsnext entry by default', async () => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta['jsnext:main'] = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve();

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.m.js'),
    );
  });

  it('should return a promise of bower dependency path with module entry by default instead of jsnext', async () => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta.module = './underscore.module.js';
      underscore.pkgMeta['jsnext:main'] = './underscore.jsnext.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve({
      module: true,
      jsnext: true,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.module.js'),
    );
  });

  it('should return a promise of bower dependency path with overridden main', async () => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta.main = ['./underscore.js'];
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve();

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(
      path.join('/', 'tmp', 'underscore', 'underscore.js'),
    );
  });

  it('should return a promise of null with missing dependency', async () => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({
        jquery: {
          canonicalDir: '/tmp/jquery',
          pkgMeta: {
            main: ['./dist/jquery.js'],
          },
        },
      })
    ));

    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeResolvedTo(null);
  });

  it('should return null with skipped dependency', () => {
    const plugin = rollupPluginbowerResolve({
      skip: ['underscore'],
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(result).toBeNull();
  });

  it('should return fail promise if dependency is not on dist', async () => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.missing = true;
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeRejectedWithError(
      "Dependency 'underscore' is missing, did you run 'bower install'?",
    );
  });

  it('should return fail promise without main entry', async () => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({
        underscore: {
          canonicalDir: '/tmp/underscore',
          pkgMeta: {},
        },
      })
    ));

    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeRejectedWithError(
      "Dependency underscore does not specify any main entry, please use 'override' options to specify main file",
    );
  });

  it('should return fail promise without js main entry', async () => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({
        bootstrap: {
          canonicalDir: '/tmp/bootstrap',
          pkgMeta: {
            main: ['bootstrap.css'],
          },
        },
      })
    ));

    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('bootstrap', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeRejectedWithError(
      "Dependency bootstrap does not specify any js main, please use 'override' options to specify main file",
    );
  });

  it('should return fail promise with multiple js main entry', async () => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({
        underscore: {
          canonicalDir: '/tmp/underscore',
          pkgMeta: {
            main: ['underscore.js', 'dist/underscore.js'],
          },
        },
      })
    ));

    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({
      offline: undefined,
      cwd: undefined,
    });

    expect(result).toBeDefined();

    await expectAsync(result).toBeRejectedWithError(
      "Dependency underscore specify multiple js main entries, please use 'override' options to specify main file",
    );
  });
});
