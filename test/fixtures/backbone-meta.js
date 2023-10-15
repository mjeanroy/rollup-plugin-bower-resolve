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

module.exports = () => ({
  endpoint: {
    name: 'backbone',
    source: 'backbone',
    target: '1.3.3',
  },
  canonicalDir: '/tmp/vendors/backbone',
  pkgMeta: {
    name: 'backbone',
    main: 'backbone.js',
    dependencies: {
      underscore: '>=1.8.3',
    },
    ignore: [
      'docs',
      'examples',
      'test',
      '*.yml',
      '*.html',
      '*.ico',
      '*.md',
      'CNAME',
      '.*',
      'karma.*',
      'package.json',
    ],
    homepage: 'https://github.com/jashkenas/backbone',
    version: '1.3.3',
    _release: '1.3.3',
    _resolution: {
      type: 'version',
      tag: '1.3.3',
      commit: '8ec88604732944f197b352a6be22c8216ea9d3a1',
    },
    _source: 'https://github.com/jashkenas/backbone.git',
    _target: '1.3.3',
    _originalSource: 'backbone',
  },
  dependencies: {
    underscore: {
      endpoint: {
        name: 'underscore',
        source: 'underscore',
        target: '>=1.8.3',
      },
      canonicalDir: '/Users/mickael/dev/rollup-plugin-bower-resolve/test/it/test2/vendors/underscore',
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
        _target: '>=1.8.3',
        _originalSource: 'underscore',
      },
      dependencies: {},
      nrDependants: 1,
    },
  },
  nrDependants: 1,
});
