# Electron Playground

<img src="./static/icon.png" width="128">

This is a base project to play around with and build proofs of concepts
in. It provides some useful configuration to be able to easily write/run
tests and package the app for a specific OS.

## Development

### Getting Started

Make sure you have Node installed on your system. It is
recommended that you use NVM or NVM for Windows. Refer to the
`.nvmrc` file in this project to see which version of Node to
install. With Node installed, navigate to the root of this project and run:

```bash
npm i
```

It is also a good idea to create a new git branch for each POC you are
developing.

### Scripts

#### Environment Variables

- `ELECTRON_WEBPACK_APP_ENV` lets the app know what context it is
  running under
- `ELECTRON_WEBPACK_APP_IS_BUILT` lets the app know if it has been
  packaged for a specific OS

#### `build`

Runs `electron-webpack` to convert contents of `src` to distributable
JS. Distributable JS is sent to `dist`

```ts
ELECTRON_WEBPACK_APP_ENV: 'production'
```

#### `dev`

Runs the dev server from `electron-webpack`. This will maximize the app
window and open the dev tools, with HMR enabled.

```ts
ELECTRON_WEBPACK_APP_ENV: 'development'
```

#### `app`

Runs the app from source without packaging it for a specific OS. Will
render as if it were packaged (no native menu, no devtools).

```ts
ELECTRON_WEBPACK_APP_ENV: 'preview'
```

#### Tests

##### `test:e2e`

Runs tests under the `spec` folder, which are intended for running the
app and running e2e tests against it. This will webpack the source code
to `dist` so that the test app is run against the distributable JS.

```ts
ELECTRON_WEBPACK_APP_ENV: 'test'
```

##### `test:main`

Runs tests nested within the `src/main` folder marked as `.e.spec.ts`,
which are intended for testing modular units of code that rely on
`electron`.

##### `test:renderer`

Runs tests nested within the `src/renderer` folder marked as
`.e.spec.ts`, which are intended for testing modular units of code that
rely on `electron`.

##### `test:bundle`

Runs tests nested within the `src` folder marked as `.w.spec.ts`, which
are intended for testing modular units of code that do not rely on
`electron` but do require `webpack` to be tested.

##### `test:all`

Runs all tests (e2e, main, renderer, and bundle) concurrently.

#### `dist`

Webpacks the source code, then runs `electron-builder`. Note that this
script is not intended to be run on its own, but rather is consumed by
other OS specific scripts.

```ts
ELECTRON_WEBPACK_APP_ENV: 'production'
ELECTRON_WEBPACK_APP_IS_BUILT: true
```

#### `dist:mac` and `dist:win`

These scripts are used to package the app per specific OS.

### Directory Structure

| Folder Name    | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| `build`        | Once the app has been packaged for a specific OS it is sent here |
| `config`       | App development configuration                                    |
| `dist`         | Webpacked distributable JS                                       |
| `spec`         | e2e tests and setup files                                        |
| `src`          | Source code and unit test files                                  |
| `src/main`     | Backend code                                                     |
| `src/renderer` | Frontend code                                                    |
| `static`       | Assets that can be used by the app, such as favicon and images   |
