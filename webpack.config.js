/* global __dirname */
const webpack = require('webpack')
const path = require('path')
var packageJSON = require('./package.json');

const paths = {
  src: path.join(__dirname, '/src/main/js'),
  webapp: path.join(__dirname, '/src/main/webapp'),
  dest: path.join(__dirname, '/target/classes/META-INF/resources/jsreact', packageJSON.name),
  node: path.join(__dirname, '/node_modules'),
  prototype: path.join(__dirname, '/src/prototype'),
  devserver: path.join(__dirname, '/node_modules/webpack-dev-server')
}

module.exports = {
  context: paths.src,
  entry: ['index.js'],
  output: {
    filename: packageJSON.name + '.js',
    path: paths.dest
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [paths.src, paths.node]
  },
  resolveLoader: {
    modules: [paths.node]
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // NODE_ENV: JSON.stringify('production')
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [paths.src, paths.devserver],
        loader: 'babel-loader',
        options: {
          presets: ['@babel/react', '@babel/env'],
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
      }, {
         test: /\.css$/,
         use: [
           {loader: 'style-loader'},
           {loader: 'css-loader'}
         ]
       }, {
        test: /\.(html|gif|jpg|png)$/,
        loader: 'file-loader',
        options: {
          name: 'media/[name].[ext]'
        }
      }, {
        test: /\.(svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  }
}