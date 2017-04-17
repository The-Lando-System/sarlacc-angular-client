import uglify from "rollup-plugin-uglify";

export default {
    entry: 'index.js',
    dest: 'bundles/sarlacc-client.umd.min.tmp',
    format: 'umd',
    moduleName: 'sarlacc-client',
    external: [
        '@angular/core'
    ],
    globals: {
        '@angular/core': 'ng.core'
    },
    plugins: [
        uglify()
    ]
}
