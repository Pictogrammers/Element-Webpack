#!/usr/bin/env node

const path = require('path');

const Webpack = require('webpack');

const config = path.resolve('./', 'webpack.config.js');
const webpackConfig = require(config);

const compiler = Webpack(webpackConfig);

const bold = (text) => '\x1b[1m' + text + '\x1b[0m';
const green = (text) => '\x1b[32m' + text + '\x1b[0m';
const red = (text) => '\x1b[31m' + text + '\x1b[0m';

compiler.run((err, result) => {
    if (err) {
        console.log('Build', bold(red('Failed')));
        console.log(err.message, err.stack);
        process.exit(1);
    } else {
        console.log('Build', bold(green('Successful')));
    }
});
