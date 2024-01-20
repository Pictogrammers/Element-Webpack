#!/usr/bin/env node

import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import { join, relative, dirname, sep } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = relative(__dirname, join(process.cwd(), 'webpack.config.js'));
const fixedConfig = config.split(sep).join('/');
const { default: webpackConfig } = await import(fixedConfig);

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
