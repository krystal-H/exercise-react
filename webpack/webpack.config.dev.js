const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.config.common");
const apiMocker = require("mocker-api");

const paths = require("./paths");

const needMock = process.env.MOCK === "mock";


const _environment = 'https://dp.clife.net';
// const _environment = 'https://200.200.200.50';

const dev = {
  mode: "development",
  devtool: "cheap-module-eval-source-map",
  devServer: {
    contentBase: paths.outPath,
    host: "localhost",
    port: "8085",
    open: true,
    openPage: "",
    hot: true, //webpack-dev-server are launched with the --hot option, webpack.HotModuleReplacementPlugin will be added automatically
    before: function (app) {
      if (needMock) {
        apiMocker(app, path.resolve(__dirname, "../src/mock/index.js"));
      }
    },
    proxy: {
      "/v1/web/": {
        // target:_environment,
        target: 'http://10.6.34.37:8080',
        changeOrigin: true,
        secure: false,
      },
      "/v4/web/": {
        target: _environment,
        changeOrigin: true,
        secure: false,
      },
      "/v5/web/": {
        target: _environment,
        // target: "http://10.8.80.120:8080",
        changeOrigin: true,
        secure: false,
      },
    },
    // proxy: {//后台本地
    //   '/v1/web/': {
    //     target: 'http://10.6.34.37:8080',
    //     changeOrigin: true,
    //     secure: false
    //   }
    // }
    // proxy: {
    //   '/v1/web/': {
    //     target: 'https://pre.cms.clife.cn',
    //     changeOrigin: true,
    //     secure: false
    //   }
    // },
  },
};

module.exports = merge(common, dev);
