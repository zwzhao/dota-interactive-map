var fs = require('fs');
var git = require('git-rev-sync');
var browserify = require('browserify');
var babelify = require("babelify");
var watchify = require('watchify');
var exorcist = require('exorcist');
var UglifyJS = require("uglify-js");
var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

var env = process.argv.indexOf('production') !== -1 ? 'production': 'development';
var bWatch = process.argv.indexOf('watch') !== -1 ? true : false;

try {
    var config = require('../config.json');
}
catch (e) {
    var config = require('../config.example.json');
}

var npmConfig = require('../package.json');
var releaseVersion = npmConfig.version;

console.log(process.argv);
console.log('env', env);
console.log('version', releaseVersion);
console.log('watch', bWatch);

var src = npmConfig.main;
var root = env == 'development' ? './www/' : './dist/';
var hash = env == 'development' ? '.' : '-' + git.short() + '.' ;
var dst = root + 'bundle' + hash + 'js';
var mapfile = dst + '.map';

var opts = {
    debug:true,
    standalone: config.appName,
    entries: [src],
    cache: {},
    packageCache: {}
};
if (bWatch) opts.plugin = [watchify];

function bundle() {
    console.time("bundle");
    b.bundle()
     .on('error', console.error)
     .pipe(exorcist(mapfile))
     .pipe(fs.createWriteStream(dst))
     .on('finish', function () {
        console.log('bundled', dst);
        console.timeEnd("bundle");
     });
    console.log('bundling', dst);
}
    
var b = browserify(opts);
if (env == 'production') {
    console.log('rollupify');
    b.transform('rollupify', {
        config: {
            plugins: [
                resolve({
                    browser: true
                }),
                commonjs()
            ]
        }
    });
}
b.transform(babelify, {
    plugins: ["transform-es2015-modules-commonjs"],
    compact: true
});

b.transform('browserify-replace', {
    replace: [
        { from: /#build_date/g, to: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' UTC' },
        { from: /#release_tag/g, to: releaseVersion },
        { from: /#code_version/g, to: git.long() },
        { from: /#rollbar_client_token/g, to: config.rollbar.client_token || "" },
        { from: /#rollbar_environment/g, to: env }
    ]
});
if (bWatch) b.on('update', bundle);

bundle();