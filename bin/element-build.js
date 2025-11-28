#!/usr/bin/env node

import Webpack from 'webpack';
import { join, relative, dirname, sep } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = relative(__dirname, join(process.cwd(), 'webpack.config.js'));
const fixedConfig = config.split(sep).join('/');
const { default: webpackConfig } = await import(fixedConfig);

// Always production for builds
webpackConfig.forEach(entry => { entry.mode = 'production' });

const compiler = Webpack(webpackConfig);

const bold = (text) => '\x1b[1m' + text + '\x1b[0m';
const green = (text) => '\x1b[32m' + text + '\x1b[0m';
const red = (text) => '\x1b[31m' + text + '\x1b[0m';

const start = Math.floor(Date.now() / 1000);

compiler.run((err, result) => {
    const total = Math.floor(Date.now() / 1000) - start;
    if (err) {
        console.log('Build', bold(red('Failed')), `${total}s`);
        console.log(err.message, err.stack);
        process.exit(1);
    } else {
        console.log('Build', bold(green('Successful')), `${total}s`);
    }
});
