'use strict';

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ZipPlugin = require('./plugins/zip-plugin')

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  devtool: false,
  output: {
      path: path.join(__dirname, 'dist'),
      filename: 'bundle.js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ZipPlugin({
      filename: 'daotin'
    })
  ]
};
