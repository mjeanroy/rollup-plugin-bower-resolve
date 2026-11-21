# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`rollup-plugin-bower-resolve` is a Rollup plugin that resolves bare imports (`import _ from 'underscore'`) against installed Bower components. It ships as a single CommonJS bundle in `dist/index.js`. `bower` and `rollup` are peer dependencies; the package has no runtime dependencies.

## Commands

Package manager is pnpm (CI uses pnpm 10; `pnpm-workspace.yaml` sets supply-chain policies such as `minimumReleaseAge`). All npm scripts delegate to gulp tasks in `gulpfile.js` → `scripts/*`.

- `pnpm test` — runs **clean → lint → build → Jasmine**. Lint errors (including warnings) fail the test run.
- `pnpm run lint` — ESLint (airbnb-base) over root `*.js`, `src/`, `test/`, `scripts/`. Any warning is treated as an error. Lint only some files with `--file` (repeatable; a path that matches nothing fails):
  ```sh
  pnpm run lint --file src/bower.js --file test/bower-spec.js
  ```
  `--file` only affects the standalone `lint` task; `build`, `test`, `tdd` and `release` always lint the whole project.
- `pnpm run build` — clean + lint + Rollup bundle to `dist/index.js`.
- `pnpm run tdd` — build once, then watch `src/` and `test/` and re-run Jasmine on change.
- `pnpm run test:unit` — runs Jasmine only (no clean/lint/build). Narrow the run with `--file` (repeatable, path relative to repo root) and/or `--filter` (regexp matched against the full spec name):
  ```sh
  pnpm run test:unit --file test/bower-spec.js
  pnpm run test:unit --file test/bower-spec.js --filter "transitive dependencies"
  ```
  `--file`/`--filter` are parsed by the shared `scripts/cli/index.js`. Don't run spec files with the plain `jasmine` CLI: specs are ES modules that need `@babel/register` and Jasmine's `require` loader, which `scripts/test/index.js` sets up.

## Architecture

- `src/index.js` — default-exports the plugin factory.
- `src/rollup-plugin-bower-resolve.js` — the plugin. On creation it kicks off a single `bower.list()` promise; `resolveId` awaits it, takes the first path segment of the importee as the package id, and resolves to:
  1. `canonicalDir + subpath` when the import has a subpath (`underscore/foo.js`),
  2. `override[importee]` if configured,
  3. otherwise `pkgMeta.module` → `jsnext:main` → `main` (when `main` is an array, exactly one `.js` entry must exist, else it throws).
  Returns `null` for entry modules, `skip`ped ids, and unknown packages so other resolvers can run.
- `src/bower.js` — wraps `bower.commands.list` (offline by default) in a promise and flattens the dependency tree, including transitive deps, into a `{ name: metadata }` map (first occurrence wins).

Unit tests spy on `bower.list` / `_bower.commands.list` using JSON fixtures in `test/fixtures/`. `test/it-spec.js` is an integration test that runs real Rollup builds (with `@rollup/plugin-commonjs`) against the committed `bower_components`-style projects in `test/it/test1` and `test/it/test2` (vendored under `vendors/` via `.bowerrc`).

## Build & release notes

- Babel targets Node 14: the default env emits CommonJS (used by `@babel/register` for gulp/tests); the `rollup` env keeps ES modules for bundling. `babel-plugin-add-module-exports` makes the CJS default export work as `require(...)`.
- The Rollup build (`scripts/build/rollup.config.js`) strips source banners, prepends `LICENSE` as banner, and formats output with Prettier. `node:path`, dependencies and peerDependencies are external.
- `dist/` is not committed on master: `release:*` tasks force-add `dist`, run `npm version`, then `git rm` it again in a "prepare next release" commit.
- Every source file carries the MIT license header; keep it on new files.

## Conventions

- **Commits** follow Conventional Commits (`feat:`, `fix:`, `chore:`, `chore(ci):`, `docs:`…): `pnpm run changelog` generates `CHANGELOG.md` from them.
- **Lint gotchas** (`.eslintrc`): `valid-jsdoc` requires a `@return` tag (even for `void`) and descriptions on every `@param`/`@return`, and its parser rejects record types such as `{{files: Array<string>}}`: use `{Object}` and describe the fields in prose. Max line length is 140.
- **Node support**: published code (`src/`) must run on Node 14 (`engines: >=14`, Babel targets Node 14). Babel transpiles syntax but not APIs, so don't use newer Node/JS APIs in `src/`. Dev tooling (`scripts/`, `test/`) may use newer APIs (e.g. `util.parseArgs`): CI runs Node 18–26 and `.nvmrc` pins 20.12.2.
- **README** is the user documentation and is maintained by hand:
  - Every new option or behaviour change must be documented there, including the version in which it was introduced (e.g. `// Since 3.2.0`), and added to the README changelog section.
  - All README examples must work and compile against the current API; update them whenever the API changes.
- `test/it/*/vendors/` are committed third-party Bower packages used by the integration tests: they are excluded from lint and must not be edited.
