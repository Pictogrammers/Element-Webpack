import { join, resolve, dirname } from 'path';
import fs from 'fs';
import CopyPlugin from "copy-webpack-plugin";
import ExtraWatchWebpackPlugin from 'extra-watch-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

import {
  getComponents,
  getComponentsFromNpmStart
} from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = getComponentsFromNpmStart();

export default function (config) {

  const DIST_DIR = config.dist || 'dist';

  const src = config.src || 'src';
  const components = getComponents(src);
  const inputs = [];

  components.forEach(({ input, examples }) => {
    inputs.push(resolve('./', input));
    examples.forEach(({ exampleInput }) => {
      inputs.push(resolve('./', exampleInput));
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
        path: resolve('./', DIST_DIR),
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
  const favFile = fs.existsSync(join(src, favicon))
    ? join(src, favicon)
    : join(__dirname, 'default', 'favicon.svg');
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
        template: `./${src}/index.html`,
      })
    );
  }

  mainEntry.devServer = {
    static: {
      directory: join('./', DIST_DIR)
    },
    compress: true,
    port: config.port || 3000,
    client: {
      logging: 'warn',
    },
  };
  return entries;
};
