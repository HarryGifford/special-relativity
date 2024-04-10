//@ts-check

const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

const isEnvDevelopment = process.env.NODE_ENV !== "production";

/** @type { import("webpack").Configuration } */
module.exports = {
  entry: "./src/bootstrap",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  cache: false,
  devtool: isEnvDevelopment ? "eval-source-map" : "source-map",
  devServer: {
    client: {
      overlay: true,
      progress: true
    },
    devMiddleware: {
      publicPath: "/"
    },
    static: {
      directory: path.resolve(__dirname, "static"),
      watch: true
    },
    host: "0.0.0.0",
    open: true
  },
  mode: isEnvDevelopment ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        include: /src/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [new CopyWebpackPlugin({ patterns: ["static"] })],
  experiments: {
    syncWebAssembly: true,
  },
};
