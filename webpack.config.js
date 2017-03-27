const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/app.ts',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public/')
    },
    module: {
        rules: [ {
            test: /\.ts$/,
            loader: "ts-loader",
            exclude: /node_modules/,
        }]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    devtool: "cheap-source-map",
    devServer: {
        contentBase: path.join(__dirname, "public/"),
        compress: true,
        port: 3000
    }
};
