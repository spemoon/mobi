(function() {
    var development = false;
    var detectTimer = 60 * 1000;
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
    } else { // 本地部署模式/线上模式

    }

    seajs.config({
        plugins: plugins,
        map: map,
        alias: {
            $: 'mobi/$.js'
        }
    });

    (function() {
        var emptyFn = function() {};
        var split = '|||';
        var storage = window.localStorage;
        var helper = {
            /**
             * 获取扩展名
             * @param url
             * @returns {*}
             */
            getExtension: function(url) {
                var arr = url.split('.');
                return arr[arr.length - 1];
            },
            /**
             * 执行代码
             * @param data
             */
            eval: function(data) {
                var g = (1, eval);
                g(data);
            },
            /**
             * ajax获取数据
             * @param url
             * @param callback
             * @returns {window.XMLHttpRequest}
             */
            ajax: function(url, callback, error, timeout) {
                var xhr = new window.XMLHttpRequest();
                var abortTimeout;
                if(isNaN(parseInt(timeout))) {
                    timeout = 15 * 1000;
                }
                if(xhr) {
                    var protocol = /^([\w-]+:)\/\//.test(url) ? RegExp.$1 : window.location.protocol;
                    xhr.open('GET', url, true);
                    xhr.onreadystatechange = function() {
                        if(xhr.readyState === 4) {
                            xhr.onreadystatechange = emptyFn;
                            clearTimeout(abortTimeout);
                            if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && protocol === 'file:')) {
                                if(typeof callback === 'function') {
                                    callback(xhr.responseText);
                                }
                            } else {
                                if(typeof error === 'function') {
                                    error(xhr);
                                }
                            }
                        }
                    };
                    if(timeout > 0) {
                        abortTimeout = setTimeout(function() {
                            xhr.onreadystatechange = emptyFn;
                            xhr.abort();
                            if(typeof error === 'function') {
                                error(xhr);
                            }
                        }, timeout);
                    }
                    xhr.send(null);
                }
                return xhr;
            },
            getContent: function(url, callback, error) {
                url += (url.indexOf('?') === -1 ? '?' : '#') + '_t=' + (+new Date());
                return helper.ajax(url, callback, error);
            },
            getMain: function(source) {
                var reg = /define\(['"]([^"']+)['"]/;
                var match = source.match(reg);
                var mainUri;
                if(match) {
                    mainUri = match[1];
                }
                return mainUri;
            },
            localRun: function(code, callback, type, offline) {
                if(code) {
                    if(type === 'script') {
                        if(offline) {
                        }
                        helper.eval(code);
                        seajs.use(helper.getMain(code), callback);
                    } else if(type === 'css') {

                    }
                } else { // 本地没有找到对应资源
                    alert('离线中不存在缓存');
                }
            },
            remoteRun: function(url, code, callback, type, version) {
                helper.getContent(url, function(data) { // 正常获取
                    helper.localRun(data, callback, type);
                    storage.setItem(url, version + split + data);
                }, function() { // 获取失败使用本地
                    helper.localRun(code, callback, type, true);
                });
            }
        };
        /**
         * localStorage中的存储结构：
         *     uri: version|||data 版本和数据使用|||分割
         * @param params
         *          url: 接受完整路径或者顶级标识
         *          version: 该资源的版本号
         *          callback: 载完资源后的回调函数
         */
        seajs.xuse = function(params) {
            var url = seajs.resolve(params.url);
            var version = (params.version || +new Date()) + '';
            var callback = params.callback || emptyFn;
            var type = params.type;
            var force = params.force; // 优先使用网络，无网络情况下才使用缓存
            if(development) {
                seajs.use(url, callback);
            } else {
                var data = storage.getItem(url);
                var ext = helper.getExtension(url); // 扩展名
                var arr; // [版本, 代码] 二元组
                var code; // 代码
                var localVersion; // 本地版本
                var isScript = !ext || ext === 'js' || type === 'script';
                var isCss = ext === 'css' || type === 'css';
                type = isScript ? 'script' : isCss ? 'css' : '';
                if(data) {
                    arr = data.split(split);
                    code = arr[1];
                    localVersion = arr[0];
                }
                if(navigator.onLine && location.href.indexOf('offline') === -1) { // 在线
                    if(force === true) { // 强制使用网络资源
                        helper.remoteRun(url, code, callback, type, version);
                    } else {
                        if(data) { // 存在缓存
                            if(localVersion === version) { // 版本正确，直接使用
                                helper.localRun(code, callback, type);
                            } else { // 版本不正确，去服务端拉取后使用
                                helper.remoteRun(url, code, callback, type, version);
                            }
                        } else { // 不存在缓存
                            helper.remoteRun(url, code, callback, type, version);
                        }
                    }
                } else { // 离线
                    helper.localRun(code, callback, type, true);
                }
            }
        };

        seajs.duse = function(url) {
            var url = seajs.resolve(url);
            var data = storage.getItem(url);
            if(data) {
                storage.removeItem(url);
            }
        };

        try {
            applicationCache.update();
        } catch(e) {

        }

        if(!development) {
            setInterval(function() {
                applicationCache.update();
            }, detectTimer);

            applicationCache.addEventListener('updateready', function() {
                if(confirm('程序已经更新，是否更新数据？')) {
                    applicationCache.swapCache();
                    location.reload();
                }
            }, true);
        }
    })();
})();