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

const Q = require('q');
const mockPromises = require('mock-promises');
const bower = require('../dist/bower');
const bowerResolve = require('../dist/rollup-plugin-bower-resolve');

describe('bowerResolve', () => {
  let underscore;

  beforeEach(() => {
    underscore = require('./fixtures/underscore-meta')();
  });

  beforeEach(() => {
    mockPromises.install(Q.makePromise);
  });

  afterEach(() => {
    mockPromises.uninstall();
  });

  it('should return null if importer is null', () => {
    const plugin = bowerResolve();
    const result = plugin.resolveId('underscore', null);
    expect(result).toBeNull();
  });

  it('should return a promise of bower dependency path', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(result).toBeDefined();
    expect(bower.list).toHaveBeenCalledWith({});

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.js');
  });

  it('should return a promise with full path', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve();
    const result = plugin.resolveId('underscore/dist/underscore.js', './app.js');

    expect(result).toBeDefined();
    expect(bower.list).toHaveBeenCalledWith({});

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/dist/underscore.js');
  });

  it('should return a promise using bower online', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve({
      offline: false,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(result).toBeDefined();
    expect(bower.list).toHaveBeenCalledWith({
      offline: false,
    });

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.js');
  });

  it('should return a promise using custom work directory', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const cwd = '/tmp';
    const plugin = bowerResolve({cwd});

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({cwd});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.js');
  });

  it('should return a promise of bower dependency path with overridden main', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve({
      override: {
        underscore: './dist/underscore.js',
      },
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/dist/underscore.js');
  });

  it('should return a promise of bower dependency path with module entry by default', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve();

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    underscore.pkgMeta.module = './underscore.m.js';
    underscore.pkgMeta.main = './underscore.js';
    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.m.js');
  });

  it('should return a promise of bower dependency path with module entry', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve({
      module: true,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    underscore.pkgMeta.module = './underscore.m.js';
    underscore.pkgMeta.main = './underscore.js';
    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.m.js');
  });

  it('should return a promise of bower dependency path with main entry if `module` is false', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve({
      module: false,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    underscore.pkgMeta.module = './underscore.m.js';
    underscore.pkgMeta.main = './underscore.js';
    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.js');
  });

  it('should return a promise of bower dependency path with jsnext entry if enabled', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve({
      jsnext: true,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    underscore.pkgMeta['jsnext:main'] = './underscore.m.js';
    underscore.pkgMeta.main = './underscore.js';
    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.m.js');
  });

  it('should return a promise of bower dependency path without jsnext entry if disabled', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve({
      jsnext: false,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    underscore.pkgMeta['jsnext:main'] = './underscore.m.js';
    underscore.pkgMeta.main = './underscore.js';
    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.js');
  });

  it('should return a promise of bower dependency path with jsnext entry by default', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve();

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    underscore.pkgMeta['jsnext:main'] = './underscore.m.js';
    underscore.pkgMeta.main = './underscore.js';
    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.m.js');
  });

  it('should return a promise of bower dependency path with module entry by default instead of jsnext', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve({
      module: true,
      jsnext: true,
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    underscore.pkgMeta.module = './underscore.module.js';
    underscore.pkgMeta['jsnext:main'] = './underscore.jsnext.js';
    underscore.pkgMeta.main = './underscore.js';
    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.module.js');
  });

  it('should return a promise of bower dependency path with overridden main', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve();

    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    underscore.pkgMeta.main = ['./underscore.js'];
    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith('/tmp/underscore/underscore.js');
  });

  it('should return a promise of null with missing dependency', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done);
    result.catch(error);

    deferred.resolve({
      jquery: {
        canonicalDir: '/tmp/jquery',
        pkgMeta: {
          main: ['./dist/jquery.js'],
        },
      },
    });

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();

    expect(error).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith(null);
  });

  it('should return null with skipped dependency', () => {
    const plugin = bowerResolve({
      skip: ['underscore'],
    });

    const result = plugin.resolveId('underscore', './app.js');

    expect(result).toBeNull();
  });

  it('should return fail promise if dependency is not on dist', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done).catch(error);

    underscore.missing = true;
    deferred.resolve({underscore});

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();
    mockPromises.tick();

    expect(error).toHaveBeenCalledWith(new Error(`Dependency 'underscore' is missing, did you run 'bower install'?`));
    expect(done).not.toHaveBeenCalled();
  });

  it('should return fail promise without main entry', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done).catch(error);

    deferred.resolve({
      underscore: {
        canonicalDir: '/tmp/underscore',
        pkgMeta: {},
      },
    });

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();
    mockPromises.tick();

    expect(error).toHaveBeenCalledWith(new Error(
        `Dependency underscore does not specify any main entry, please use 'override' options to specify main file`
    ));

    expect(done).not.toHaveBeenCalled();
  });

  it('should return fail promise without js main entry', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve();
    const result = plugin.resolveId('bootstrap', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done).catch(error);

    deferred.resolve({
      bootstrap: {
        canonicalDir: '/tmp/bootstrap',
        pkgMeta: {
          main: ['bootstrap.css'],
        },
      },
    });

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();
    mockPromises.tick();

    expect(error).toHaveBeenCalledWith(new Error(
        `Dependency bootstrap does not specify any js main, please use 'override' options to specify main file`
    ));

    expect(done).not.toHaveBeenCalled();
  });

  it('should return fail promise with multiple js main entry', () => {
    const deferred = Q.defer();
    const promise = deferred.promise;

    spyOn(bower, 'list').and.returnValue(promise);

    const plugin = bowerResolve();
    const result = plugin.resolveId('underscore', './app.js');

    expect(bower.list).toHaveBeenCalledWith({});
    expect(result).toBeDefined();

    const done = jasmine.createSpy('done');
    const error = jasmine.createSpy('error');
    result.then(done).catch(error);

    deferred.resolve({
      underscore: {
        canonicalDir: '/tmp/underscore',
        pkgMeta: {
          main: ['underscore.js', 'dist/underscore.js'],
        },
      },
    });

    expect(done).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    // Resolve previous two promises.
    mockPromises.tick();
    mockPromises.tick();
    mockPromises.tick();

    expect(error).toHaveBeenCalledWith(new Error(
        `Dependency underscore specify multiple js main entries, please use 'override' options to specify main file`
    ));

    expect(done).not.toHaveBeenCalled();
  });
});
