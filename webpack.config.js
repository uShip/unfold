/* eslint-env node*/
const path = require('path');

module.exports = {
    output: {
        library: 'unfold',
        libraryTarget: 'umd'
    },

    externals: [{
        'jquery': {
            root: 'jQuery',
            commonjs2: 'jquery',
            commonjs: 'jquery',
            amd: 'jquery'
        }
    }],

    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname, './src')
                ]
            }
        ]
    }
};