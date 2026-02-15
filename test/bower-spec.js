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

/* eslint-disable global-require */

import _bower from 'bower';
import { bower } from '../src/bower';

describe('bower', () => {
  let cwd;

  beforeEach(() => {
    cwd = process.cwd();
  });

  it('should get the list of bower dependencies', async () => {
    const underscore = require('./fixtures/underscore-meta')();
    const main = require('./fixtures/test1-meta')();
    const dependencies = { underscore };

    const response = {
      on: jasmine.createSpy('on').and.callFake((evt, cb) => {
        if (evt === 'end') {
          cb(main);
        }

        return response;
      }),
    };

    spyOn(_bower.commands, 'list').and.returnValue(response);

    const promise = bower.list();

    expect(promise).toBeDefined();
    expect(_bower.commands.list).toHaveBeenCalledWith(undefined, {
      json: true,
      offline: true,
      cwd,
    });

    expect(response.on).toHaveBeenCalledWith('end', jasmine.any(Function));
    expect(response.on).toHaveBeenCalledWith('error', jasmine.any(Function));

    await expectAsync(promise).toBeResolvedTo(dependencies);
  });

  it('should get the list of bower dependencies with transitive dependencies', async () => {
    const backbone = require('./fixtures/backbone-meta')();
    const main = require('./fixtures/test2-meta')();
    const dependencies = {
      backbone,
      underscore: backbone.dependencies.underscore,
    };

    const response = {
      on: jasmine.createSpy('on').and.callFake((evt, fn) => {
        if (evt === 'end') {
          fn(main);
        }

        return response;
      }),
    };

    spyOn(_bower.commands, 'list').and.returnValue(response);

    const promise = bower.list();

    expect(promise).toBeDefined();
    expect(_bower.commands.list).toHaveBeenCalledWith(undefined, {
      json: true,
      offline: true,
      cwd,
    });

    expect(response.on).toHaveBeenCalledWith('end', jasmine.any(Function));
    expect(response.on).toHaveBeenCalledWith('error', jasmine.any(Function));

    await expectAsync(promise).toBeResolvedTo(dependencies);
  });

  it('should get the list of bower dependencies using custom options', async () => {
    const underscore = require('./fixtures/underscore-meta')();
    const main = require('./fixtures/test1-meta')();
    const dependencies = { underscore };

    const response = {
      on: jasmine.createSpy('on').and.callFake((evt, fn) => {
        if (evt === 'end') {
          fn(main);
        }

        return response;
      }),
    };

    spyOn(_bower.commands, 'list').and.returnValue(response);

    const offline = false;
    const tmp = '/tmp';

    const promise = bower.list({ offline, cwd: tmp });

    expect(promise).toBeDefined();
    expect(_bower.commands.list).toHaveBeenCalledWith(undefined, {
      json: true,
      offline,
      cwd: tmp,
    });

    expect(response.on).toHaveBeenCalledWith('end', jasmine.any(Function));
    expect(response.on).toHaveBeenCalledWith('error', jasmine.any(Function));

    await expectAsync(promise).toBeResolvedTo(dependencies);
  });

  it('should reject promises with error', async () => {
    const error = {};
    const response = {
      on: jasmine.createSpy('on').and.callFake((evt, fn) => {
        if (evt === 'error') {
          fn(error);
        }

        return response;
      }),
    };

    spyOn(_bower.commands, 'list').and.returnValue(response);

    const promise = bower.list();

    expect(promise).toBeDefined();
    expect(_bower.commands.list).toHaveBeenCalledWith(undefined, {
      json: true,
      offline: true,
      cwd,
    });

    expect(response.on).toHaveBeenCalledWith('end', jasmine.any(Function));
    expect(response.on).toHaveBeenCalledWith('error', jasmine.any(Function));

    await expectAsync(promise).toBeRejectedWith(error);
  });
});
