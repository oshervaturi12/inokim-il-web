const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin'); // Explicit import for JS minification
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');


const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    js: './public/js/index.js',
    css: './public/css/main.scss',
    tracker: './public/js/tracker.js',
  },
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: '[name].[contenthash].bundle.js', // 👈 Add contenthash
    assetModuleFilename: 'images/[name].[contenthash][ext][query]', // 👈 Add contenthash to images
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.scss', '.css'], // Allow imports without specifying extensions
    alias: {
      '~': path.resolve(__dirname, 'public')
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Ensure Babel works properly
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][hash][ext]', // Cache-busting image output
        },
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, // Extract CSS to separate files
          'css-loader', // Turns CSS into CommonJS
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer')(), // Adds vendor prefixes
                  ...(isProduction
                    ? [
                        require('@fullhuman/postcss-purgecss')({
                          content: ['./public/**/*.html', './public/**/*.js'],
                          safelist: ['important-class'], // Keep specific classes
                        }),
                      ]
                    : []),
                 
                ],
              },
            },
          },
          'sass-loader', // Compiles Sass to CSS
        ],
      },
    ],
  },
  optimization: {
    minimize: isProduction, // Enable minimization in production mode
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console logs in production
          },
        },
      }),
      new CssMinimizerPlugin(), // Minify CSS
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      // filename: '[name].css',
      filename: '[name].[contenthash].css',
    }),
    ...(isProduction
      ? [
          new CompressionPlugin({
            algorithm: 'gzip',
          }),
        ]
      : [
          new BundleAnalyzerPlugin({
            openAnalyzer: false, // Prevent analyzer from opening the browser automatically
          }),
        ]),
        new WebpackManifestPlugin({
          fileName: 'manifest.json',
          publicPath: '/dist/', // optional
        }),
  ],
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'eval-source-map', // Use source maps for debugging
};