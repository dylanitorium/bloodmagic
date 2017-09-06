// eslint-disable-next-line no-unused-vars
const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bloodmagic.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, 'node_modules'),
        options: { presets: ['es2015', 'react'] },
      },
      {
        test: /\.(scss|sass|css)$/,
        use: ExtractTextPlugin.extract({
          use: [
                        { loader: 'css-loader', options: { minimize: true, sourceMap: true } },
                        { loader: 'sass-loader', options: { includePaths: [path.resolve(__dirname, 'node_modules')] } },
          ],
        }),
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'file-loader?name=images/[name].[ext]',
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader?name=fonts/[name].[ext]',
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('bloodmagic.css'),
    new HtmlWebpackPlugin({
      title: 'bloodmagic',
      template: 'src/templates/index.html',
      inject: false,
    }),
  ],
};
