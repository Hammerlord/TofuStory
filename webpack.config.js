const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "[name].[hash].js",
    },
    module: {
        rules: [
            { test: /\.([cm]?ts|tsx)$/, loader: "ts-loader" },
            { test: /\.(js)$/, use: "babel-loader" },
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader: "file-loader",
                options: {
                    name: "[path][name].[ext]",
                },
            },
            {
                test: /\.svg$/,
                use: ["@svgr/webpack"],
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            handlebars: "handlebars/dist/handlebars.js",
        },
    },
    devServer: {
        hot: true,
        open: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),
    ],
};
