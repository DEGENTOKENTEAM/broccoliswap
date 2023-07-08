/* eslint-disable no-undef */
// webpack.config.js
const path = require("path")
const slsw = require("serverless-webpack")
const nodeExternals = require("webpack-node-externals")

module.exports = {
    mode: slsw.lib.webpack.isLocal ? "dev" : "production",
    entry: slsw.lib.entries,
    resolve: {
        extensions: [".ts", ".js"],
    },
    target: "node",
    externalsPresets: { node: true },
    // externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.(tsx?)$/,
                loader: "ts-loader",
                options: {
                    transpileOnly: true,
                },
                exclude: [
                    [
                        path.resolve(__dirname, "node_modules"),
                        path.resolve(__dirname, ".serverless"),
                        path.resolve(__dirname, ".webpack"),
                    ],
                ],
            },
        ],
    },
}
