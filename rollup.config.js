import resolve from '@rollup/plugin-node-resolve';
import commonjs from "@rollup/plugin-commonjs";
import alias from '@rollup/plugin-alias';
import url from '@rollup/plugin-url';

const aliasToPreact = () => alias({
    entries: [
        { find: 'react', replacement: 'preact/compat/src' },
        { find: 'react-dom', replacement: 'preact/compat/src' }
    ]
});

const anyUrl = () => url({
    include: ['**/*.svg', '**/dist/assets/index.css', '**/*.png', '**/*.jp(e)?g', '**/*.gif', '**/*.webp'],
    limit: Number.MAX_SAFE_INTEGER
})

export default {
    input: "src/test.js",
    output: {
        file: "dist/assets/bundle.js",
        format: "iife",
        name: "bundle"
    },
    plugins: [aliasToPreact(), commonjs(), anyUrl(), resolve()],
}
