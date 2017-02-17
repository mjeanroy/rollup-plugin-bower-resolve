/**
* The MIT License (MIT)
*
* Copyright (c) 2016 Mickael Jeanroy
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

const Q = require('q');
const bower = require('bower');
const bowerUtil = require('../src/bower-util');
const mockPromises = require('mock-promises');

describe('bower-util', () => {
  beforeEach(() => {
    mockPromises.install(Q.makePromise);
  });

  afterEach(() => {
    mockPromises.uninstall();
  });

  it('should get the list of bower dependencies', () => {
    const response = jasmine.createSpyObj('bowerList', ['on']);
    response.on.and.returnValue(response);

    spyOn(bower.commands, 'list').and.returnValue(response);

    const promise = bowerUtil.list();

    expect(promise).toBeDefined();
    expect(bower.commands.list).toHaveBeenCalledWith({
      json: true,
      offline: true,
    });

    expect(response.on).toHaveBeenCalledWith('end', jasmine.any(Function));
    expect(response.on).toHaveBeenCalledWith('error', jasmine.any(Function));

    const onEnd = jasmine.createSpy('end');
    const onError = jasmine.createSpy('error');
    promise.then(onEnd);
    promise.catch(onError);

    mockPromises.tick();
    expect(onEnd).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    const dependencies = {
      underscore: {
        endpoint: {
          name: 'underscore',
          source: 'underscore',
          target: '1.8.3',
        },
        canonicalDir: '/Users/mickael/dev/test-rollup-plugin-bower-resolve/vendors/underscore',
        pkgMeta: {
          name: 'underscore',
          version: '1.8.3',
          main: 'underscore.js',
          keywords: ['util', 'functional', 'server', 'client', 'browser'],
          ignore: [
            'docs',
            'test',
            '*.yml',
            'CNAME',
            'index.html',
            'favicon.ico',
            'CONTRIBUTING.md',
            '.*',
            'component.json',
            'package.json',
            'karma.*',
          ],
          homepage: 'https://github.com/jashkenas/underscore',
          _release: '1.8.3',
          _resolution: {
            type: 'version',
            tag: '1.8.3',
            commit: 'e4743ab712b8ab42ad4ccb48b155034d02394e4d',
          },
          _source: 'https://github.com/jashkenas/underscore.git',
          _target: '1.8.3',
          _originalSource: 'underscore',
        },
        missing: true,
        nrDependants: 1,
        versions: [],
        update: {
          target: '1.8.3',
          latest: '1.8.3',
        },
      },
    };

    response.on.calls.first().args[1]({
      endpoint: {
        name: 'rollup-plugin-bower-resolve',
        source: '/Users/mickael/dev/rollup-plugin-bower-resolve',
        target: '*',
      },

      canonicalDir: '/Users/mickael/dev/rollup-plugin-bower-resolve',
      pkgMeta: {
        name: 'rollup-plugin-bower-resolve',
        description: 'Use the bower resolution algorithm with Rollup',
        main: 'src/rollup-plugin-bower-resolve.js',
        authors: 'mjeanroy <mickael.jeanroy@gmail.com>',
        license: 'MIT',
        dependencies: {},
        devDependencies: {},
      },

      dependencies: dependencies,
      nrDependants: 0,
      versions: [],
    });

    expect(onEnd).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    mockPromises.tick();
    expect(onEnd).toHaveBeenCalledWith(dependencies);
    expect(onError).not.toHaveBeenCalled();
  });

  it('should reject promises with error', () => {
    const response = jasmine.createSpyObj('bowerList', ['on']);
    response.on.and.returnValue(response);

    spyOn(bower.commands, 'list').and.returnValue(response);

    const promise = bowerUtil.list();

    expect(promise).toBeDefined();
    expect(bower.commands.list).toHaveBeenCalledWith({
      json: true,
      offline: true,
    });

    expect(response.on).toHaveBeenCalledWith('end', jasmine.any(Function));
    expect(response.on).toHaveBeenCalledWith('error', jasmine.any(Function));

    const onEnd = jasmine.createSpy('end');
    const onError = jasmine.createSpy('error');
    promise.then(onEnd);
    promise.catch(onError);

    mockPromises.tick();
    expect(onEnd).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    const error = {};
    response.on.calls.mostRecent().args[1](error);

    expect(onEnd).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    mockPromises.tick();
    expect(onEnd).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(error);
  });
});
