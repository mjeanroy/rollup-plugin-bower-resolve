/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2023 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const path = require('node:path');
const { parseArgs } = require('node:util');
const gulp = require('gulp');
const Jasmine = require('jasmine');
const config = require('../config');

/**
 * Read CLI options used to restrict the test run:
 * - `--file <path>`: spec file to run (may be repeated).
 * - `--filter <regexp>`: only run specs whose full name matches.
 *
 * @return {Object} The options: `files` (array of spec paths) and `filter` (optional string).
 */
function readCliOptions() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    strict: false,
    options: {
      file: { type: 'string', multiple: true },
      filter: { type: 'string' },
    },
  });

  const files = (values.file || []).map((file) => (
    path.relative(config.root, path.resolve(config.root, file)).split(path.sep).join('/')
  ));

  return {
    files,
    filter: values.filter,
  };
}

/**
 * Create a function running the Jasmine suite.
 *
 * @param {Object} options Options: `files` (spec paths to run) and `filter` (spec name filter).
 * @return {function} The function executing the test suite.
 */
function loadJasmine({ files, filter } = {}) {
  const runner = new Jasmine({
    projectBaseDir: config.root,
  });

  runner.loadConfig({
    failSpecWithNoExpectations: true,
    jsLoader: 'require',
    spec_dir: path.basename(config.test),
    spec_files: [
      '**/*-spec.js',
      '**/*.spec.js',
    ],
  });

  runner.exitOnCompletion = false;
  return () => runner.execute(files && files.length > 0 ? files : undefined, filter);
}

function deleteRequireCache() {
  Object.keys(require.cache).forEach((id) => {
    delete require.cache[id];
  });
}

/**
 * Run unit test suite and exit.
 *
 * Optionally, run a subset of the test suite:
 *   pnpm run test:unit --file test/bower-spec.js --filter "should list dependencies"
 *
 * @return {Promise<void>} A promise resolved when the test suite has been executed.
 */
function test() {
  return loadJasmine(readCliOptions())().then((result) => {
    if (result.overallStatus !== 'passed') {
      throw new Error('JasmineError');
    }
  });
}

/**
 * Watch for changes, and run unit test suite on every change.
 *
 * @param {function} done The `done` callback.
 * @return {void}
 */
function tdd(done) {
  const inputs = [
    path.join(config.src, '**', '*.js'),
    path.join(config.test, '**', '*.js'),
  ];

  gulp.watch(inputs, () => {
    // Usually, the require.cache is not a problem, because the process should exit after load.
    // But in tdd mode, the process never exit.
    // So, when it runs a second time, jasmine does not detect anything because the cache is
    // already bloated, and jasmine does not detect any changes, or load outdated files.
    deleteRequireCache();
    return loadJasmine()();
  });

  done();
}

module.exports = {
  test,
  tdd,
};
