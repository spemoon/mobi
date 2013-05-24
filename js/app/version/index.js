define(function(require, exports, module) {
    var $ = require('$');

    $(function() {
        var box = $('#box');
        $.history.listen({
            home: function() {
                seajs.use('./home/index', function(callback) {
                    callback({
                        r: {
                            $: $
                        }
                    });
                });
            },
            'user/:id': function(id) { // :通配符
                seajs.use('./user/index', function(callback) {
                    callback({
                        r: {
                            $: $
                        },
                        p: {
                            id: id
                        }
                    });
                });
            },
            'about': function() { // *通配符
                seajs.use('./about/index', function(callback) {
                    callback({
                        r: {
                            $: $
                        }
                    });
                });
            },
            defaultRouter: 'info/1'
        });
    });
});