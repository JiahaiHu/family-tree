const path = require('path');

module.exports = {
    entry: {
        main: './static/scripts/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'build.js'
    },
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif)$/, 
                loader: 'url-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                  presets: ['es2015', 'react', 'stage-0']
                }
            },
            {   test: /\.css$/, 
                loader: 'style-loader!css-loader?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]' 
            },
            { 
                test: /\.(woff|svg|eot|ttf)\??.*$/,
                loader: 'url-loader?name=[path][name].[ext]'
            }
        ]
    }
}