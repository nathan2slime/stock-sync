// @ts-check

import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';

import path from 'node:path';

import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  context: import.meta.dirname,

  target: 'node',

  entry: {
    main: isDev
      ? ['@rspack/core/hot/poll?100', './src/main.ts']
      : './src/main.ts',
  },

  output: {
    clean: true,

    filename: '[name].cjs',
    chunkFilename: '[id].cjs',

    hotUpdateChunkFilename: '[id].[fullhash].hot-update.cjs',

    chunkFormat: 'commonjs',
    chunkLoading: 'require',
  },

  resolve: {
    extensions: ['...', '.ts', '.tsx', '.jsx'],

    mainFields: ['source', 'browser', 'module', 'main'],

    tsConfig: {
      references: 'auto',
      configFile: path.resolve(import.meta.dirname, './tsconfig.json'),
    },
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            detectSyntax: 'auto',

            jsc: {
              parser: {
                decorators: true,
              },

              transform: {
                legacyDecorator: true,
                decoratorMetadata: true,
              },
            },
          },
        },
      },
    ],
  },

  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          compress: {
            keep_classnames: true,
            keep_fnames: true,
          },

          mangle: {
            keep_classnames: true,
            keep_fnames: true,
          },
        },
      }),
    ],
  },

  externalsType: 'commonjs',

  plugins: isDev
    ? [
        new RunScriptWebpackPlugin({
          name: 'main.cjs',
          autoRestart: false,
        }),

        new rspack.HotModuleReplacementPlugin(),
      ]
    : [],

  externals: [
    // @ts-ignore
    nodeExternals({
      allowlist: [/@rspack\/core\/hot\/poll/],
    }),
  ],
});