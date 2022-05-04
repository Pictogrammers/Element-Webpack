#!/usr/bin/env node

const path = require('path');

const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const config = path.resolve('./', 'webpack.config.js');
const webpackConfig = require(config);

const compiler = Webpack(webpackConfig);

// main.js Entry is always last
const lastEntry = webpackConfig[webpackConfig.length - 1];
const server = new WebpackDevServer(lastEntry.devServer, compiler);

const bold = (text) => '\033[1m' + text + '\033[0m';
const green = (text) => '\x1b[32m' + text + '\x1b[0m';
const red = (text) => '\x1b[31m' + text + '\x1b[0m';

server.startCallback((err) => {
    if (err) {
        console.log(err.name, red(err.message));
        if (err.stack) {
            console.log(err.stack);
        }
    } else {
        console.log('Server', bold(green(`http://localhost:${server.options.port}`)));
    }
});
