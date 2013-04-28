define(function(require, exports, module) {
    var $ = require('./core');

    var optionalParam = /\((.*?)\)/g;
    var namedParam = /(\(\?)?:\w+/g;
    var splatParam = /\*\w+/g;
    var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    var defaultRouter = 'defaultRouter'; // 默认key
    var defaultHash; // 默认触发的hash，可以是一个字符串，或者是一个function

    var helper = {
        routeToReg: function(route) {
            route = route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam,function(match, optional) {
                return optional ? match : '([^\/]+)';
            }).replace(splatParam, '(.*?)');
            return new RegExp('^' + route + '$');
        },
        getHash: function() {
            return location.hash.replace(/^#/, '');
        },
        match: function(hash, cache) {
            if(hash && hash !== defaultRouter) {
                for(var key in cache) {
                    var item = cache[key];
                    var match = hash.match(item.reg);
                    if(match) {
                        item.action.apply(null, $.isArray(match) ? match.slice(1) : []);
                        break;
                    }
                }
            } else {
                if(defaultHash) {
                    var fn;
                    if(typeof defaultHash === 'string') {
                        fn = cache[defaultHash].action;
                    } else if(typeof defaultHash === 'function') {
                        fn = defaultHash;
                    }
                    if(fn) {
                        fn(cache);
                    }
                }
            }
        }
    };

    var iframe;
    var supportHash = ('onhashchange' in window) && ($.isUndefined(document.documentMode) || document.documentMode === 8);
    var lastHash = helper.getHash();
    var cache = {};

    var r = {
        get: helper.getHash,
        trigger: function(hash) {
            location.hash = hash;
        },
        listen: function(obj) {
            (function() {
                for(var key in obj) {
                    if(key !== defaultRouter) {
                        if(!cache[key]) {
                            cache[key] = {
                                reg: helper.routeToReg(key),
                                action: obj[key]
                            };
                        }
                    } else {
                        defaultHash = obj[key];
                    }
                }
            })();

            if(supportHash) {
                window.onhashchange = function(e) {
                    var prev = e.oldURL;
                    var url = e.newURL;
                    var hash = helper.getHash();
                    if(prev !== url) {
                        helper.match(hash, cache);
                    }
                };
            } else {
                if(!iframe) {
                    $(function() {
                        var el = $('<iframe tabindex="-1" style="display:none" widht="0" height="0"/>').appendTo(document.body);
                        iframe = el[0].contentWindow;
                        el.bind('load', function() {
                            var hash = helper.getHash();
                            el.unbind('load');
                            var doc = iframe.document;
                            doc.open();
                            doc.write('<!DOCTYPE html><html><body>' + hash + '</body></html>');
                            doc.close();
                            setInterval(function() {
                                var hash = helper.getHash();// 主窗口中的hash
                                var historyHash = iframe.document.body.innerText;// 上一次hash
                                if(hash !== lastHash) { // 主窗口hash改变
                                    lastHash = hash;
                                    if(hash !== historyHash) {
                                        doc.open();
                                        doc.write('<!DOCTYPE html><html><body>' + hash + '</body></html>');
                                        doc.close();
                                    }
                                    helper.match(hash, cache);
                                } else if(historyHash !== lastHash) {// 回退/前进
                                    location.hash = historyHash;
                                }
                            }, 50);
                        });
                    });
                }
            }
            var initHash = helper.getHash(); // 进入页面时候的hash
            if(initHash) {
                helper.match(initHash, cache);
            } else {
                if(defaultHash) {
                    helper.match(defaultHash, cache);
                }
            }
        }
    };

    return r;
});