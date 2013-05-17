(function() {
    var development = false;
    var version = '0.0.1';

    var plugins = [];
    var map = [];
    if(development) { // 开发模式
        plugins.push('nocache');
        var dist = 'public/js/dist/';
        var src = 'js/'
        var mobi = ['public/js/mobi/', 'js/lib/util/'];

        map.push(function(url) {
            if (url.indexOf(dist) > 0) {
                url = url.replace(dist, src);
            }
            return url;
        });

        map.push(mobi);
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
            $: 'mobi/$.js'
        }
    });
})();