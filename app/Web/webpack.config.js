var path = require('path');

module.exports = {
    devtool: "eval",
    output: {
        filename: "bundle.js"
    },
    module: {
        loaders: [{
            test: /\.pug$/,
            loader: 'pug',
            include: path.join(__dirname, 'src/pug'),
            exclude: path.join(__dirname, 'node_modules')
        }]
    },
    resolve: {
        root: [
            path.join(__dirname, 'src'),
            path.join(__dirname, 'node_modules')
        ]
    }
};
