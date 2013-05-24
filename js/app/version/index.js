define(function(require, exports, module) {
    var $ = require('$');
    var page = {
        home: {
            url: 'dist/app/version/home/index',
            version: '0.0.2'
        },
        user: {
            url: 'dist/app/version/user/index',
            version: '0.0.1'
        },
        about: {
            url: 'dist/app/version/about/index',
            version: '0.0.1'
        }
    };

    var fn = function(name, args) {
        var p = page[name];
        if(p) {
            seajs.xuse({
                url: p.url,
                version: p.version,
                callback: function(mod) {
                    mod($.extend({
                        r: {
                            $: $
                        }
                    }, args));
                }
            });
        } else {

        }
    };
    $(function() {
        var box = $('#box');
        // 路由
        $.history.listen({
            home: function() {
                fn('home');
            },
            'user/:id': function(id) { // :通配符
                fn('user', {
                    p: {
                        id: id
                    }
                });
            },
            about: function() {
                fn('about');
            },
            defaultRouter: 'user/1'
        });
    });
});