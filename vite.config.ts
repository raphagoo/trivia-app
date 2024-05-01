import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 8080
    },
    plugins: [
        vue(),
        // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
        vuetify({
            autoImport: true,
        }),
    ],
    define: { 'process.env': {} },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    base: '/trivia-app/',
    /* remove the need to specify .vue files https://vitejs.dev/config/#resolve-extensions
    resolve: {
        extensions: [
        '.js',
        '.json',
        '.jsx',
        '.mjs',
        '.ts',
        '.tsx',
        '.vue',
        ]
    },
  */
})
