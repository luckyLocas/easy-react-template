const path = require('path');
const webpack = require('webpack');
const apiMocker = require('mocker-api');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: false,
    port: 9000,
    host: '0.0.0.0',
    historyApiFallback: true,
    before(app) {
      apiMocker(app, path.resolve('mock/api.js'), {
        proxy: {
          '/api/(.*)': 'http://192.168.66.12:8763'
        },
        changeHost: true
      });
    }
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: [{
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      }],
      exclude: /node_modules/,
    },
    {
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: true
          }
        }
      ],
      include: /\.module\.css$/
    },
    {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ],
      exclude: /\.module\.css$/
    },
    {
      test: /\.less$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: true
          }
        },
        {
          loader: 'less-loader',
          options: {
            javascriptEnabled: true
          }
        }
      ],
      include: /\.module\.less$/
    },
    {
      test: /\.less$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'less-loader',
          options: {
            javascriptEnabled: true
          }
        }
      ],
      exclude: /\.module\.less$/
    },
    {
      test: /\.(png|jpe?g|gif|svg|ttf|woff2?|eot|swf|xml)$/i,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        }
      },],
    },
    ],
  },
  plugins: [
    // new webpack.ProvidePlugin({
    //   $: "jquery",
    //   jQuery: "jquery"
    // }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new webpack.DefinePlugin({
      PROCESS_DEV_ENV: true,
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.html'],
    alias: {
      '@': path.resolve('src'),
    }
  },
  output: {
    filename: 'bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
};