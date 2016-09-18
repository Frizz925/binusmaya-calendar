var path = require('path');

module.exports = {
    devtool: "eval",
    entry: "./src/client/index",
    output: {
        path: path.join(__dirname, "../public/assets/js"),
        filename: "bundle.js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            include: path.join(__dirname, 'src'),
            exclude: path.join(__dirname, 'node_modules')
        }, {
            test: /\.pug$/,
            loader: 'pug',
            include: path.join(__dirname, 'src/pug'),
            exclude: path.join(__dirname, 'node_modules')
        }, {
            test: /\.json$/,
            loader: 'json'
        }]
    },
    resolve: {
        root: [
            path.join(__dirname, 'src'),
            path.join(__dirname, 'node_modules')
        ]
    }
};
