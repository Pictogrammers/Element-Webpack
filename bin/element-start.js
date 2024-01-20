#!/usr/bin/env node

import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

const { default: webpackConfig } = await import('./../../../../webpack.config.js');

const compiler = Webpack(webpackConfig);

// main.js Entry is always last
const lastEntry = webpackConfig[webpackConfig.length - 1];
const server = new WebpackDevServer(lastEntry.devServer, compiler);

const bold = (text) => '\x1b[1m' + text + '\x1b[0m';
const green = (text) => '\x1b[32m' + text + '\x1b[0m';
const red = (text) => '\x1b[31m' + text + '\x1b[0m';

server.startCallback((err) => {
    if (err) {
        console.log(err.name, red(err.message));
        if (err.stack) {
            console.log(err.stack);
            process.exit(1);
        }
    } else {
        console.log('Server', bold(green(`http://localhost:${server.options.port}`)));
    }
});
