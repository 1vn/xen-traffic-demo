var webpack = require("webpack")
var plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
  })
];

if (process.env.NODE_ENV == 'production') {
  plugins.push( new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }))
}

module.exports = {
  entry: {
    xen:"./xen.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: __dirname+"/../xen-server/assets/js/"
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx|es6)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }
    ],
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx|es6)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.es6', '.jsx']
  },
  plugins: plugins,
}