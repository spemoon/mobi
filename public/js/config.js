(function() {
    var development = true;
    var version = '0.0.1';

    var plugins = ['shim'];
    var map = [];
    if(development) { // 开发模式
        plugins.push('nocache');
        var dist = 'public/js/dist/';
        var src = 'js/'

        map.push(function(url) {
            if (url.indexOf(dist) > 0) {
                url = url.replace(dist, src);
            }
            return url;
        });
    } else { // 本地部署模式/线上模式
        map.push(function(url) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + '_v=' + version;
            return url;
        });
    }

    seajs.config({
        plugins: plugins,
        map: map,
        alias: {
            jquery: {
                src: 'jquery/jquery-1.9.1.min.js',
                exports: 'jQuery'
            }
        }
    });
})();