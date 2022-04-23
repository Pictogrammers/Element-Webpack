const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const {
  dashToCamel,
  getComponents
} = require('./utils');

module.exports = (config) => {

  const DIST_DIR = config.dist || 'dist';

  const components = getComponents('src');
  const inputs = [];

  components.forEach(({ input, examples }) => {
    inputs.push(input);
    examples.forEach(({ exampleInput }) => {
      inputs.push(exampleInput);
    });
  });

  return (env, argv) => {
    const entries = [];
    const mode = argv.mode === 'production' ? 'production' : 'development';

    if (config.before) {
      config.before(components, mode);
    }

    function addEntries(input, name) {
      entries.push({
        mode: mode,
        entry: input,
        module: {
          rules: [
            {
              test: /\.(css|html)$/i,
              use: 'raw-loader',
            },
            {
              test: /\.ts$/,
              use: 'ts-loader',
              exclude: /node_modules/,
            },
          ],
        },
        resolve: {
          extensions: ['.ts', '.js'],
        },
        output: {
          filename: `${name}.js`,
          path: path.resolve('./', DIST_DIR),
        },
        performance: {
          hints: false
        },
        stats: {
          preset: 'errors-warnings',
        },
        infrastructureLogging: {
          level: 'warn',
        },
      });
    }

    /* if (mode === 'production') {
      components.forEach(({ input, name }) => {
        addEntries(input, name);
      });
    } */
    addEntries(inputs, 'main');
    // Output Basic Runtime
    entries[entries.length - 1].plugins = [];
    if (config.copy) {
      entries[entries.length - 1].plugins.push(
        new CopyPlugin({
          patterns: config.copy
        })
      );
    };
    entries[entries.length - 1].plugins.push(
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
            if (config.after) {
              config.after(components, mode);
            }
          });
        }
      }
    );
    entries[entries.length - 1].plugins.push(
      new ExtraWatchWebpackPlugin({
        files: [
          ...(config.copy || []),
          './src/index.html'
        ],
      }),
    );
    entries[entries.length - 1].plugins.push(
      new HtmlWebpackPlugin({
        template: './src/index.html',
      })
    );

    entries[entries.length - 1].devServer = {
      static: {
        directory: path.join('./', DIST_DIR)
      },
      compress: true,
      port: config.port || 3000,
      client: {
        logging: 'warn',
      },
    };
    return entries;
  };
};
