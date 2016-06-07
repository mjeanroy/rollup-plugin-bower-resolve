# rollup-plugin-bower-resolve

[![Build Status](https://travis-ci.org/mjeanroy/rollup-plugin-bower-resolve.svg?branch=master)](https://travis-ci.org/mjeanroy/rollup-plugin-bower-resolve)

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

## License

MIT
