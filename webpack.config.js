const path = require("path");

module.exports = {
  mode: "development",
  entry: "./app/index.ts",
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "releases/dev"),
  },
  module: {
    rules: [{ test: /\.[jt]sx?$/, use: "babel-loader" }],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devServer: {
    contentBase: "./releases/dev",
    host: "0.0.0.0",
    port: 8000,
    compress: true,
    // Prevent webpack dev server injection
    inline: false,
    writeToDisk: true,
  },
};
