# rollup-plugin-bower-resolve

[![Greenkeeper badge](https://badges.greenkeeper.io/mjeanroy/rollup-plugin-bower-resolve.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/mjeanroy/rollup-plugin-bower-resolve.svg?branch=master)](https://travis-ci.org/mjeanroy/rollup-plugin-bower-resolve)
![CI](https://github.com/mjeanroy/rollup-plugin-bower-resolve/workflows/CI/badge.svg)
[![Npm version](https://badge.fury.io/js/rollup-plugin-bower-resolve.svg)](https://badge.fury.io/js/rollup-plugin-bower-resolve)

Locate modules using the bower resolution algorithm for using third party modules in your bower component directory.

## Installation

```bash
npm install --save-dev rollup-plugin-bower-resolve
```

## Usage

```js
import { rollup } from 'rollup';
import bowerResolve from 'rollup-plugin-bower-resolve';

rollup({
  entry: 'main.js',
  plugins: [
    bowerResolve({
      // The working directory to use with bower (i.e the directory where
      // the `bower.json` is stored).
      // Default is `process.cwd()`.
      cwd: '/tmp',

      // Use `bower` offline.
      // Default is `true`.
      offline: false,

      // Use "module" field for ES6 module if possible, default is `true`.
      // See: https://github.com/rollup/rollup/wiki/pkg.module
      module: true,

      // Use "jsnext:main" field for ES6 module if possible, default is `true`.
      // This field should not be used, use `module` entry instead, but it is `true`
      // by default because of legacy packages.
      // See: https://github.com/rollup/rollup/wiki/jsnext:main
      jsnext: true,

      // if there's something your bundle requires that you DON'T
      // want to include, add it to 'skip'
      skip: [ 'some-big-dependency' ],  // Default: []

      // Override path to main file (relative to the module directory).
      override: {
        lodash: 'dist/lodash.js'
      }
    })
  ]
}).then( bundle => bundle.write({ dest: 'bundle.js', format: 'iife' }) );
```

This plugin may be used with `rollup-plugin-commonjs` to support non ES6 module:

```js
import { rollup } from 'rollup';
import bowerResolve from 'rollup-plugin-bower-resolve';
import commonjs from 'rollup-plugin-commonjs';

rollup({
  entry: 'main.js',
  plugins: [
    bowerResolve(),
    commonjs()
  ]
}).then(bundle => bundle.write({
  dest: 'bundle.js',
  moduleName: 'MyModule',
  format: 'iife'
})).catch(err => console.log(err.stack));
```

## Changelog

- 2.0.1
  - Add `engines` field in `package.json` file.
- 2.0.0
  - Add support for rollup 2.x.x
  - Remove support for node < 10.0.0
- 1.0.1
  - Add `engines` field in `package.json` file.
- 1.0.0
  - Remove support for rollup < 1.0.0.
  - Remove support for node < 6.0.0
- 0.6.0
  - Dependency updates.
- 0.5.0
  - Fix importing main entry point when it is located in a sub directory.
  - Dependency updates.
- 0.4.0
  - Fix `offline` mode (and add options to disable offline).
  - Add `cwd` option.
  - Fix transitive dependency resolution.
- 0.3.0
  - Add `module` option
  - Add `jsnext` option
- 0.2.0
  - List dependencies once

## License

MIT
