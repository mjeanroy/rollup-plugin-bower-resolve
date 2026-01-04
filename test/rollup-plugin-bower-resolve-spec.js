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

import path from 'path';
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

  it('should return a promise of bower dependency path', (done) => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({ underscore })
    ));

    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(result).toBeDefined();
    expect(bower.list).toHaveBeenCalledWith({});

    const then = jasmine.createSpy('then');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.js'),
      );

      done();
    });
  });

  it('should return a promise with full path', (done) => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({ underscore })
    ));

    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('underscore/dist/underscore.js', './app.js');

    expect(result).toBeDefined();
    expect(bower.list).toHaveBeenCalledWith({});

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'dist', 'underscore.js'),
      );

      done();
    });
  });

  it('should return a promise using bower online', (done) => {
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
    });

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.js'),
      );

      done();
    });
  });

  it('should return a promise using custom work directory', (done) => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({ underscore })
    ));

    const cwd = '/tmp';
    const plugin = rollupPluginbowerResolve({ cwd });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({ cwd });
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.js'),
      );

      done();
    });
  });

  it('should return a promise of bower dependency path with overridden main', (done) => {
    spyOn(bower, 'list').and.callFake(() => (
      Promise.resolve({ underscore })
    ));

    const plugin = rollupPluginbowerResolve({
      override: {
        underscore: './dist/underscore.js',
      },
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'dist', 'underscore.js'),
      );

      done();
    });
  });

  it('should return a promise of bower dependency path with module entry by default', (done) => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta.module = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve();

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.m.js'),
      );

      done();
    });
  });

  it('should return a promise of bower dependency path with module entry', (done) => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta.module = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve({
      module: true,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.m.js'),
      );

      done();
    });
  });

  it('should return a promise of bower dependency path with main entry if `module` is false', (done) => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta.module = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve({
      module: false,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.js'),
      );

      done();
    });
  });

  it('should return a promise of bower dependency path with jsnext entry if enabled', (done) => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta['jsnext:main'] = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve({
      jsnext: true,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.m.js'),
      );

      done();
    });
  });

  it('should return a promise of bower dependency path without jsnext entry if disabled', (done) => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta['jsnext:main'] = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve({
      jsnext: false,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.js'),
      );

      done();
    });
  });

  it('should return a promise of bower dependency path with jsnext entry by default', (done) => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta['jsnext:main'] = './underscore.m.js';
      underscore.pkgMeta.main = './underscore.js';
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve();

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.m.js'),
      );

      done();
    });
  });

  it('should return a promise of bower dependency path with module entry by default instead of jsnext', (done) => {
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

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.module.js'),
      );

      done();
    });
  });

  it('should return a promise of bower dependency path with overridden main', (done) => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.pkgMeta.main = ['./underscore.js'];
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve();

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(
        path.join('/', 'tmp', 'underscore', 'underscore.js'),
      );

      done();
    });
  });

  it('should return a promise of null with missing dependency', (done) => {
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

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).not.toHaveBeenCalled();
      expect(then).toHaveBeenCalledWith(null);
      done();
    });
  });

  it('should return null with skipped dependency', () => {
    const plugin = rollupPluginbowerResolve({
      skip: ['underscore'],
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(result).toBeNull();
  });

  it('should return fail promise if dependency is not on dist', (done) => {
    spyOn(bower, 'list').and.callFake(() => {
      underscore.missing = true;
      return Promise.resolve({ underscore });
    });

    const plugin = rollupPluginbowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).toHaveBeenCalledWith(new Error("Dependency 'underscore' is missing, did you run 'bower install'?"));
      expect(then).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return fail promise without main entry', (done) => {
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

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).toHaveBeenCalledWith(new Error(
        "Dependency underscore does not specify any main entry, please use 'override' options to specify main file",
      ));

      expect(then).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return fail promise without js main entry', (done) => {
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

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).toHaveBeenCalledWith(new Error(
        "Dependency bootstrap does not specify any js main, please use 'override' options to specify main file",
      ));

      expect(then).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return fail promise with multiple js main entry', (done) => {
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

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const then = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');

    result.then(then).catch(error).finally(() => {
      expect(error).toHaveBeenCalledWith(new Error(
        "Dependency underscore specify multiple js main entries, please use 'override' options to specify main file",
      ));

      expect(then).not.toHaveBeenCalled();
      done();
    });
  });
});
