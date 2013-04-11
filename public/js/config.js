define(function(require, exports, module) {
    var development = true;
    var plugins = ['shim'];
    var map = [];
    if(development) {
        plugins.push('nocache');
        map.push(function(url) {
            var dist = 'public/js/dist/';
            var src = 'js/src/app/'
            if (url.indexOf(dist) > 0) {
                url = url.replace(dist, src);
            }
            return url;
        });
    }

    seajs.config({
        plugins: plugins,
        map: map,
        alias: {
            'jquery': {
                src: 'jquery/jquery-1.9.1.min.js',
                exports: 'jQuery'
            }
        }
    });
});