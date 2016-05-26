/* eslint-env node*/
const path = require('path');

module.exports = {
    output: {
        library: 'unfold',
        libraryTarget: 'umd'
    },

    externals: [{
        'jquery': 'jQuery'
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