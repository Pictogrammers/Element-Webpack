#!/usr/bin/env node

const path = require('path');

const Webpack = require('webpack');

const config = path.resolve('./', 'webpack.config.js');
const webpackConfig = require(config);

const compiler = Webpack(webpackConfig());

compiler.run((err, result) => {
    console.log('Build', err, result);
});
