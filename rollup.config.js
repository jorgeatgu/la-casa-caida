// ------ JavaScript
import { babel } from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// ------ postCSS
import postcss from 'rollup-plugin-postcss';
import atImport from 'postcss-import';
import selector from 'postcss-custom-selectors';
import customProperties from 'postcss-custom-properties';
import sorting from 'postcss-sorting';
import nested from 'postcss-nested';
import stylelint from 'rollup-plugin-stylelint';

// ------ global
import browsersync from 'rollup-plugin-browsersync';

const production = !process.env.ROLLUP_WATCH;

const paths = {
  js: 'src/js',
  css: 'src/css',
  images: 'src/img/*',
  distCss: 'css/',
  distJs: 'js/',
  distImages: 'img/'
};

const plugins = [
  eslint({
    exclude: [
      paths.css + '/**'
    ]
  }),
  browsersync({
    host: 'localhost',
    port: 3000,
    server: {
      baseDir: ['./']
    },
    files: [
      'css/*.**',
      'js/*.**',
      'data/*.*',
      './*.html'
    ],
    open: true
  }),
  resolve(),
  commonjs(),
  babel({
    exclude: 'node_modules/**',
    include: paths.js + '/**',
    presets: ['@babel/preset-env'],
    babelHelpers: 'bundled'
  }),
  production && terser()
];

export default [{
    input: paths.css + '/styles.css',
    output: {
      file: paths.distCss + '/styles.css',
      format: 'es'
    },
    plugins: [
      stylelint(),
      postcss({
        extract: true,
        sourceMap: true,
        plugins: [
          atImport(),
          selector(),
          customProperties(),
          sorting(),
          nested()
        ],
        extensions: ['.css'],
        minimize: true
      })
    ]
  },{
    input: paths.js + '/index.js',
    output: [{
      file: paths.distJs + '/index.js',
      format: 'iife',
      sourcemap: true
    }],
    plugins
  },
  {
    input: paths.js + '/comparador.js',
    output: [{
      file: paths.distJs + '/comparador.js',
      format: 'iife',
      sourcemap: true
    }],
    plugins
  },
  {
    input: paths.js + '/jb.js',
    output: [{
      file: paths.distJs + '/jb.js',
      format: 'iife',
      sourcemap: true
    }],
    plugins
  },
  {
    input: paths.js + '/d3.js',
    output: {
      file: paths.distJs + '/d3.min.js',
      format: 'umd',
      name: 'd3',
      moduleName: 'd3',
      external: ['d3']
    },
    plugins
  },
  {
    watch: {
      include: ['css/*.css', 'js/*.js', './*.html', 'csv/**']
    }
  }
];
