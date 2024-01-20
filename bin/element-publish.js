#!/usr/bin/env node

import { resolve } from 'path';
import { readFileSync } from 'fs';
import Webpack from 'webpack';

const config = resolve('./', 'webpack.config.js');

// Always Production for Publish
const { default: webpackConfig } = await import('./../../../../webpack.config.js');

const compiler = Webpack(webpackConfig);

const bold = (text) => '\x1b[1m' + text + '\x1b[0m';
const green = (text) => '\x1b[32m' + text + '\x1b[0m';
const red = (text) => '\x1b[31m' + text + '\x1b[0m';

compiler.run((err, result) => {
    if (err) {
        console.log('Build', bold(red('Failed')));
        console.log(err.message, err.stack);
    } else {
        console.log('Build', bold(green('Successful')));
        console.log('Run...');
        console.log('┌─────────────┐');
        console.log('│ cd publish  │');
        console.log('│ npm publish │');
        console.log('└─────────────┘');
    }
});