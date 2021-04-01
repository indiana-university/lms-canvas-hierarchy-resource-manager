/* global __dirname */
const webpack = require('webpack')
const path = require('path')
var packageJSON = require('./package.json');
var copyWebpackPlugin = require('copy-webpack-plugin');

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
//  entry: 'App.js',
  entry: ['babel-polyfill', 'index.js'],
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
    }),
    new webpack.optimize.UglifyJsPlugin({
      uglifyOptions: {
        compress: { warnings: false },
        beautify: false,
        comments: false
      },
      sourceMap: true
    }),
    new copyWebpackPlugin([
        { from: paths.node + '/tinymce/plugins', to: './plugins' },
        { from: paths.node + '/tinymce/themes', to: './themes' },
        { from: paths.node + '/tinymce/skins', to: './skins' },
        { from: paths.node + '/tinymce/icons', to: './icons' }
    ])
  ],
  devServer: {
    port: 8080,
    contentBase: [ paths.prototype, paths.webapp ],
    historyApiFallback: true
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        include: [paths.src, paths.devserver],
        loader: 'babel-loader',
        options: {
          presets: ['react', 'env', 'stage-2']
        }
      }, {
        test: /\.(less)$/,
        loaders: [
          `file-loader?name=media/${packageJSON.name}.css`,
          'postcss-loader',
          'less-loader'
        ]
      }, {
         test: /\.css$/,
         loaders: ['style-loader', 'css-loader']
       }, {
        test: /\.(html|gif|jpg|png)$/,
        loader: 'file-loader?name=media/[name].[ext]'
      },
      {
          test: require.resolve('tinymce/tinymce'),
          loaders: [
              'imports-loader?this=>window',
              'exports-loader?window.tinymce'
          ]
      },
      {
          test: /tinymce\/(themes|plugins)\//,
          loaders: [
              'imports-loader?this=>window'
          ]
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