/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */
import path, {resolve} from 'path';
import VueDevTools from 'vite-plugin-vue-devtools';
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {readFileSync} from 'fs';

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json')));

export default defineConfig({
  plugins: [
    VueDevTools(),
    vue(),
  ],
  define: {
    VITE_DEFINE_ADMIN_VERSION: JSON.stringify(packageJson.version),
  },
  resolve: {
    extensions: [
      '.mjs',
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
      '.vue',
    ],
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@src': path.resolve(__dirname, 'src'),
      '@apis': path.resolve(__dirname, 'src/apis'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@codecs': path.resolve(__dirname, 'src/codecs'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@composables': path.resolve(__dirname, 'src/composables'),
      '@containers': path.resolve(__dirname, 'src/containers'),
      '@interface': path.resolve(__dirname, 'src/interface'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@router': path.resolve(__dirname, 'src/router'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@views': path.resolve(__dirname, 'src/views'),
      '@common': path.resolve(__dirname, 'src/common'),
    },
  },
});
