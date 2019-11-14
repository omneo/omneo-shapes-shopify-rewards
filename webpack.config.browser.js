module.exports = {
    entry: "./src/browser.js",
    output: {
      filename:"shapes-shopify-checkout.js"
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/, 
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: ["@babel/plugin-transform-arrow-functions"] 
            }
          }
        }
      ]
    }
};