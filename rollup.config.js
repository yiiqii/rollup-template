import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import clear from 'rollup-plugin-clear';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import postcss from 'rollup-plugin-postcss';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import livereload from 'rollup-plugin-livereload';

const production = process.env.BUILD === 'production';
const file = production ? `index.js` : `index.debug.js`;
const distFold = 'dist';
const config = {
  input: 'src/index.js',
  output: {
    file: `${distFold}/${file}`,
    format: 'iife',
  },
  plugins: [
    clear({
      targets: [distFold],
    }),
    resolve(),
    commonjs(),
    babel({
      babelrc: false,
      include: ['./src/**/*.js'],
      presets: [
        '@babel/preset-env',
      ],
      plugins: [
        ['@babel/plugin-transform-runtime'],
      ],
      babelHelpers: 'runtime',
    }),
    cleanup(),
    postcss({
      extract: true,
      minimize: production ? { safe: true } : false,
    }),
    (production && uglify({
      output: {
        comments: /^!/,
      },
    })),
    htmlTemplate({
      template: 'www/index.html',
    }),
    // watch html
    ((files) => ({
      buildStart() {
        files.forEach(file => this.addWatchFile(file));
      },
    }))(['www/index.html']),
  ],
};

if (process.argv.includes('--watch')) {
  config.plugins.push(serve({
    contentBase: distFold,
    host: 'localhost',
    port: 8080,
  }), livereload(distFold));
}

export default config;
