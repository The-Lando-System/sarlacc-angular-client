export default {
    entry     : 'index.js',
    dest      : 'bundles/sarlacc-client.umd.tmp',
    format    : 'umd',
    external  : [
        '@angular/core'
    ],
    globals   : {
        '@angular/core': 'ng.core',
    },
    moduleName: 'sarlacc-client'
}
