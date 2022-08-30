//@ts-check

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require("path");

const isEnvDevelopment = process.env.NODE_ENV !== "production";
const isHttps = process.env.HTTPS === "true";

/** @type { import("webpack").Configuration } */
module.exports = {
  entry: "./src/bootstrap",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isEnvDevelopment ? "[name].js" : "[id].[contenthash].js"
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
    https: isHttps,
    open: true,
    port: isHttps ? 4001 : 3000
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
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "static",
          globOptions: { ignore: ["**/index.html"] }
        }
      ]
    }),
    new HtmlWebpackPlugin({ template: "static/index.html" })
  ]
};
