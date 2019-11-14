var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: "./src/browser.js",
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/, 
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              "presets": ["@babel/preset-env", "@babel/preset-react"]
            }
          }
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader"
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
          inject: 'head',
        template: "./src/index.html",
        filename: "./index.html"
      })
    ]
};