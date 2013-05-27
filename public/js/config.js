(function() {
    var development = false;
    var plugins = [];
    var map = [];
    if(location.href.indexOf('development') > 0) {
        development = true;
    }
    if(development) { // 开发模式
        plugins.push('nocache');
        var dist = 'public/js/dist/';
        var src = 'js/'
        var mobi = ['public/js/mobi/', 'js/lib/util/'];
        map.push(function(url) {
            if(url.indexOf(dist) > 0) {
                url = url.replace(dist, src);
            }
            return url;
        });
        map.push(mobi);
    }

    seajs.development = development;
    if(seajs.vuse) {
        seajs.vuse.updateConfirm = function() {
            return confirm('程序已经更新，是否更新数据？');
        };
    }
    seajs.config({
        plugins: plugins,
        map: map,
        alias: {
            $: 'mobi/$.js'
        }
    });
})();