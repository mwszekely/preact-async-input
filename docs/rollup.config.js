import resolve from '@rollup/plugin-node-resolve';
import commonjs from "@rollup/plugin-commonjs";
import url from '@rollup/plugin-url';

const anyUrl = () => url({
    include: ['**/*.svg', '**/dist/assets/index.css', '**/*.png', '**/*.jp(e)?g', '**/*.gif', '**/*.webp'],
    limit: Number.MAX_SAFE_INTEGER
})

export default {
    input: "main.js",
    output: {
        file: "bundle.js",
        format: "iife",
        name: "bundle",
    },
    plugins: [commonjs(), anyUrl(), resolve({ dedupe: ['preact', "preact/compat", "preact/hooks"] })],
}