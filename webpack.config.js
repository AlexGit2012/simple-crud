// Generated using webpack-cli https://github.com/webpack/webpack-cli

import path from "path";
import { fileURLToPath } from "url";
import NodemonPlugin from "nodemon-webpack-plugin";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import Dotenv from "dotenv-webpack";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV == "production";
const isMulti = process.env.NODE_ENV === "multi";

const config = {
  entry: "./index.ts",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.cjs",
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    new NodemonPlugin(),
    new NodePolyfillPlugin(),
    new Dotenv({
      path: "./.env",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", "..."],
    fallback: {
      cluster: false,
    },
  },
  stats: {
    errorDetails: true,
  },
};

if (isProduction) {
  config.mode = "production";
} else {
  config.mode = "development";
}

if (isMulti) {
  config.plugins.push(new webpack.EnvironmentPlugin({ NODE_ENV: "multi" }));
}

export default config;
