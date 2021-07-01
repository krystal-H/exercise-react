const webpack = require('webpack');
// const path = require('path');
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const common = require('./webpack.config.common');

// let getAbsolutePath = _path => path.resolve(__dirname, _path);

const prod = {
  mode: 'production',
  devtool: 'cheap-module-source-map',
  // entry: {
  //   index: ['@babel/polyfill', getAbsolutePath('../src/index.js')]
  // },
  optimization: {
    minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin({})], // OptimizeCSSAssetsPlugin用于压缩提取后的css文件
    runtimeChunk: 'single',
    namedModules: true,
    namedChunks: true,
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '~',
      automaticNameMaxLength: 30,
      name: true,
      cacheGroups: {
        vendor: { //第三方依赖包可以通过dll，优化打包速度
          chunks: 'all',
          name:'vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          enforce: true
        },
        "antd-vendor": {
            chunks: 'all',
            name:'antd-vendor',
            test: /([\\/]antd[\\/])|(icons[\\/]lib)/,
            priority: 1
        },
        common: {
            chunks: 'all',
            name:'common',
            test: /([\\/]src[\\/]util)|(src[\\/]components[\\/])/,
            priority: 2
        }
      }
    }
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    new CleanWebpackPlugin(),
    new webpack.ContextReplacementPlugin(
      /moment[/\\]locale$/,
      /zh-cn/,
    ),
    new ProgressBarPlugin(),
    new LodashModuleReplacementPlugin(
      {
        'collections':true,
        'paths':true
      }
    ), // lodash 按需引入插件,但是这个插件可能导致一些问题；  DISCLAIMER: Using this plugin without enabling the proper feature sets may cause lodash functions to behave in unexpected ways. Methods may appear to work, however they might return incorrect results.
    new BundleAnalyzerPlugin() // 打包分析，分包策略确定好之后可以关闭
  ]
}

module.exports = merge(common, prod);