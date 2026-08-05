const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/index.js",

    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js",
        clean: true
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        })
    ],

    devServer: {
        static: "./dist",
        open: true,
        hot: true
    }
};