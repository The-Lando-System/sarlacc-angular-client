export default {
    entry     : 'index.js',
    dest      : 'bundles/sarlacc-client.umd.tmp',
    format    : 'umd',
    external  : [
        '@angular/core',
        '@angular/http',
        'angular2-cookie/services/cookies.service'
    ],
    globals   : {
        '@angular/core': 'ng.core',
    },
    moduleName: 'sarlacc-client'
}
