const path = require('path');
const fs = require('fs');
const CopyPlugin = require("copy-webpack-plugin");
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const {
  getComponents,
  getComponentsFromNpmStart
} = require('./utils');

const args = getComponentsFromNpmStart();

module.exports = (config) => {

  const DIST_DIR = config.dist || 'dist';

  const components = getComponents('src');
  const inputs = [];

  components.forEach(({ input, examples }) => {
    inputs.push(path.resolve('./', input));
    examples.forEach(({ exampleInput }) => {
      inputs.push(path.resolve('./', exampleInput));
    });
  });


  const entries = [];
  const mode = config.mode || 'development';

  if (config.before) {
    config.before(components, args, mode);
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
    return entries[entries.length - 1];
  }

  // Individual *.js for each component (very slow)
  if (mode === 'production') {
    components.forEach(({ input, name }) => {
      addEntries(`./${input}`, name);
    });
  }
  // main.js Entry
  const mainEntry = addEntries(inputs, 'main');
  // Output Basic Runtime
  mainEntry.plugins = [];
  if (config.copy) {
    mainEntry.plugins.push(
      new CopyPlugin({
        patterns: config.copy
      })
    );
  };
  const favicon = config.favicon || 'favicon.svg';
  const favFile = fs.existsSync(path.join('src', favicon))
    ? path.join('src', favicon)
    : path.join(__dirname, 'default', 'favicon.svg');
  mainEntry.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: favFile,
          to: `favicon.svg`
        }
      ]
    })
  );
  mainEntry.plugins.push(
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          if (config.after) {
            config.after(components, args, mode);
          }
        });
      }
    }
  );
  mainEntry.plugins.push(
    new ExtraWatchWebpackPlugin({
      files: config.watch || []
    }),
  );
  if (config.index) {
    mainEntry.plugins.push(
      new HtmlWebpackPlugin({
        templateContent: () => {
          return config.index(components, args, mode);
        },
      })
    );
  } else {
    mainEntry.plugins.push(
      new HtmlWebpackPlugin({
        template: './src/index.html',
      })
    );
  }

  mainEntry.devServer = {
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
