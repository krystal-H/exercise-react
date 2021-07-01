const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineManifestWebpackPlugin = require("inline-manifest-webpack-plugin");
const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const paths = require("./paths");

// 判断是否为开发调试环境
const devMode = process.env.NODE_ENV === "development";

let { outPath, staticPath, imgInCssPuclicPath } = paths;

let miniCssExtractLoader = {
  loader: MiniCssExtractPlugin.loader,
  options: {
    publicPath: imgInCssPuclicPath, // 注意提取后的css文件中，静态资源路径问题
    hmr: devMode,
    reloadAll: true,
  },
};

let cssLoader = [
  // 样式loader的公共部分
  devMode ? "style-loader" : miniCssExtractLoader, // 开发环境不要提取css文件，可提升速度
  "css-loader",
  "postcss-loader",
];

let getAbsolutePath = (_path) => path.resolve(__dirname, _path);

let common = {
  entry: {
    index: getAbsolutePath("../src/index.js"),
  },
  output: {
    path: outPath,
    hashDigestLength: 8,
    // 开发环境时不要做计算Hash，可提升速度
    filename: devMode ? `js/[name].js` : `js/[name].[chunkhash].js`,
  },
  resolve: {
    alias: {
      "@src": getAbsolutePath("../src"),
    },
    //If multiple files share the same name but have different extensions, webpack will resolve the one with the extension listed first in the array and skip the rest.
    extensions: [".js", ".jsx", ".ts", ".tsx", ".scss"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: "pre",
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          cache: true,
          formatter: require("eslint-friendly-formatter"),
          // fix: true,	// 是否启用自动修复，出错时的解决方案，这将会更改源文件，慎重选择是否进行修复错误！！！
          //emitWarning: true,
          //failOnError: true,
          quiet: false, // 禁用警告
          outputReport: false,
        },
      },
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [...cssLoader],
      },
      {
        test: /\.(scss|sass)$/,
        use: [...cssLoader, "sass-loader"],
      },
      {
        test: /\.less$/,
        use: [...cssLoader, "less-loader"],
      },
      {
        test: /\.svg$/,
        use: {
          loader: "url-loader",
          options: {
            name: devMode ? `[name].[ext]` : `[name].[hash].[ext]`,
            outputPath: staticPath + "/images",
            limit: 1,
          },
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif)/,
        use: {
          loader: "url-loader",
          options: {
            name: devMode ? `[name].[ext]` : `[name].[hash].[ext]`,
            outputPath: staticPath + "/images",
            limit: 10 * 1024, // 文件size小于此设置，使用url-loader转换成base64，否则会使用file-loader进行处理
          },
        },
      },
      {
        test: /\.(eot|woff2?|ttf)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              name: devMode ? `[name].[ext]` : `[name].[hash].[ext]`,
              limit: 1 * 1024,
              outputPath: staticPath + "/fonts",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // Automatically load modules instead of having to import or require them everywhere. 自动引入模块，注意要配合eslint进行配置，否则会有未定义警告
    new webpack.ProvidePlugin({
      // _ : 'lodash' //此种写法，会导致整个lodash打包;
    }),
    //  It creates a CSS file per JS file which contains CSS.
    new MiniCssExtractPlugin({
      filename: staticPath + `/css/[name].[contenthash].css`,
      ignoreOrder: false,
    }),
    new HtmlWebpackPlugin({
      template: "public/index.html",
      filename: "index.html",
      favicon: "./favicon.ico",
      inject: "body",
      hash: true,
      cache: true,
    }),
    new InlineManifestWebpackPlugin(), //runtime代码内联进入html
  ],
};

if (!devMode) {
  common.plugins = [
    new webpack.DllReferencePlugin({
      manifest: require("../dll/react_libs-manifest.json"), // eslint-disable-line
    }),
    ...common.plugins,
    new AddAssetHtmlPlugin({
      filepath: path.resolve(__dirname, "../dll/*.dll.js"),
      outputPath: "js/",
      publicPath: "js/",
    }),
  ];
}

module.exports = common;
