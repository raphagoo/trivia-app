import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import babelParser from '@babel/eslint-parser'
import globals from 'globals'

const scriptParserOptions = {
    requireConfigFile: false,
    babelOptions: {
        presets: ['@babel/preset-typescript'],
        // vue-eslint-parser hands the .vue file path through; force a .ts
        // filename so preset-typescript's syntax detection kicks in.
        filename: 'file.ts',
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
}

export default [
    {
        ignores: ['dist/**', '.agent-office/**'],
    },
    js.configs.recommended,
    ...vue.configs['flat/essential'],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
        },
        rules: {
            // Type-only imports/params look unused without type-aware linting.
            'no-unused-vars': 'off',
        },
    },
    {
        files: ['**/*.ts', '**/*.vue'],
        rules: {
            // Type positions (generics, inline type literals, ambient
            // declarations) aren't understood without type-aware parsing;
            // the TypeScript compiler is responsible for catching these.
            'no-undef': 'off',
        },
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: babelParser,
            parserOptions: scriptParserOptions,
        },
    },
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: babelParser,
                ...scriptParserOptions,
            },
        },
    },
    {
        files: ['cypress/**'],
        languageOptions: {
            globals: {
                ...globals.mocha,
                cy: 'readonly',
                Cypress: 'readonly',
            },
        },
    },
    {
        rules: {
            'vue/multi-word-component-names': 'off',
        },
    },
]
