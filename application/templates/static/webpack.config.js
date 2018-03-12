const path = require('path');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
var webpackUglifyJsPlugin = require('webpack-uglify-js-plugin');
var WebpackClearConsole = require("webpack-clear-console").WebpackClearConsole;
var WebpackStrip = require('strip-loader');

module.exports = {
  entry: {
    //vendor: "./scripts/vendor.js",
    bundle: "./scripts/index.js"
  },
  output: {
    path: './scripts',
    filename: "[name].build.js"
  },
  module: {
    loaders: [
			{ test: /\.js$/, loader: WebpackStrip.loader('debug', 'console.log') },
      {
        test: /\.(es6|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        loader: "style!css"
      },
      {
        test: /\.(jpg|png)$/,
        loader: "url?limit=8192"
      },
      {
        test: /\.scss$/,
        loader: "style!css!sass"
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: "file?name=../../static/styles/fonts/[name].[ext]"
      }
		]	
  },
	plugins: [
		new ngAnnotatePlugin({
			add: true,
		}),
		new webpackUglifyJsPlugin({
			cacheFolder: path.resolve(__dirname, 'public/cached_uglify/'),
			debug: true,
			minimize: true,
			sourceMap: false,
			output: {
				comments: false
			},
			compressor: {
				warnings: false
			}
		})
	]
};
