const electronWebpackConfig = require('electron-webpack/webpack.renderer.config')

const mochaConfig = async env => {
  const baseConfig = await electronWebpackConfig(env)
  console.log({ baseConfig })
  return baseConfig
}

mochaConfig({})

module.exports = mochaConfig
