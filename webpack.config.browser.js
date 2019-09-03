module.exports = {
    entry: "./src/browser.js",
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/, 
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        }
      ]
    }
};