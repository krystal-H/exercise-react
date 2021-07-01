const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const paths = require('./paths');
const { dllSrc } = paths;

module.exports = {
    mode:'production',
    entry: {
      react_libs: ['react','react-dom','redux','react-redux','react-router-dom','redux-thunk','immutable','axios','@loadable/component','redux-immutable']
    },
    output: {
      path: dllSrc,
      filename: '[name].[hash:8].dll.js',
      library:'[name]_dll'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DllPlugin({
          path: path.join(__dirname, '..', 'dll' , "[name]-manifest.json"),
          name: '[name]_dll'
        })
    ]
};