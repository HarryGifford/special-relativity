//@ts-check

const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

const isEnvDevelopment = process.env.NODE_ENV !== "production";
const isHttps = process.env.HTTPS === "true";

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
    contentBase: ["static"],
    host: "0.0.0.0",
    https: isHttps,
    open: true,
    overlay: true,
    publicPath: "/",
    port: isHttps ? 4001 : 3000,
    watchContentBase: true,
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
