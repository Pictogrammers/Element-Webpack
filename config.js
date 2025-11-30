import { join, resolve, dirname, relative } from 'path';
import fs from 'fs';
import CopyPlugin from "copy-webpack-plugin";
import ExtraWatchWebpackPlugin from 'extra-watch-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
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
            test: /\.css$/i,
            use: [{
              loader: "css-loader",
              options: {
                exportType: "css-style-sheet",
              },
            }],
          },
          {
            test: /\.html$/i,
            use: [{
              loader: 'html-loader',
              options: {
                minimize: true,
                sources: {
                  urlFilter: (attribute, value, resourcePath) => {
                    if (/favicon.svg$/.test(value)) {
                      return false;
                    }
                    return true;
                  },
                },
              },
            }],
          },
          {
            test: /\.ts$/,
            use: [{
              loader: 'ts-loader',
              options: {
                allowTsInNodeModules: true,
              }
            }],
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
      optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
          terserOptions: {
            keep_classnames: true
          }
        })],
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
  if (config.copy && config.copy.length > 0) {
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
        compiler.hooks.watchRun.tap('WatchRunPlugin', (module) => {
          if (module.modifiedFiles.size) {
            if (config.update) {
              config.update(Array.from(module.modifiedFiles).map((toPath) => {
                return relative('./', toPath);
              }));
            }
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
