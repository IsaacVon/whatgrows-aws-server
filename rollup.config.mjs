import fs from 'fs';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import externals from 'rollup-plugin-node-externals';

const pkg = JSON.parse(
  fs.readFileSync(path.resolve('./package.json'), 'utf-8')
);

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [externals({ deps: true }), resolve(), typescript()],
  external: [...Object.keys(pkg.dependencies)],
};
