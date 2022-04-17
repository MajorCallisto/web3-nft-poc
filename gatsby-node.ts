const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [
      new NodePolyfillPlugin(),
      new webpack.IgnorePlugin({
        resourceRegExp: /^fs$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^electron$/,
      }),
    ],
  });
};
