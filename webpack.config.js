const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = (env) => {
  const plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': !env ? false : JSON.stringify(env.NODE_ENV)
    }),
    new CopyPlugin({
      patterns: [
        { from: '.*.env' }
      ]
    }),
    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          '@nestjs/microservices',
          '@nestjs/platform-express',
          '@nestjs/microservices/microservices-module',
          '@nestjs/websockets/socket-module',
          '@types/crypto-js',
          'cache-manager',
          'class-validator',
          'class-transformer',
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource);
        } catch (err) {
          return true;
        }
        return false;
      },
    }),
  ];

  return {
    entry: __dirname + '/src/lambda.ts',
    optimization: {
      nodeEnv: false,
      minimize: false,
    },
    output: {
      libraryTarget: "commonjs2",
      filename: "lambda.js",
      path: __dirname + "/dist/"
    },
    resolve: {
      alias:{
        '@app': path.resolve( __dirname, 'src' )
      },
      extensions: [".ts", ".js"]
    },
    node: { crypto: true },
    devtool: "source-map",
    target: "node",
    mode: process.env.NODE_ENV || "production",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader"
        }
      ]
    },
    plugins: plugins
  };
};
