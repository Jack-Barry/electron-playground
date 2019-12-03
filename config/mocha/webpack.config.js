const electronWebpackConfig = require('electron-webpack/webpack.renderer.config')

const mochaConfig = async env => {
  const baseConfig = await electronWebpackConfig(env)
  return baseConfig
}

module.exports = mochaConfig
