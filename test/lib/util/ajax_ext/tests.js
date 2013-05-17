seajs.use(['../../../../js/lib/util/ajax_ext', '../../../../js/lib/util/core'], function(ajax, $) {
    $(function() {
        module('ajax base');
        asyncTest('simple', function() {
            ajax.base({
                url: './200.php',
                success: function(data) {
                    equal(data.data, 'hello');
                    start();
                }
            });
        });
        asyncTest('not json', function() {
            ajax.base({
                url: './parsererror.php',
                error: function(xhr, type) {
                    equal(type, 'parsererror');
                    start();
                }
            });
        });
        asyncTest('permission', function() {
            var flag = false;
            ajax.base({
                url: './permission.php',
                permission: function(data) {
                    ok(true);
                    ajax.setNoPermissionAction(function() {
                        flag = true;
                    });
                    ajax.base({
                        url: './permission.php',
                        complete: function() {
                            ok(flag);
                            start();
                        }
                    });
                }
            });
        });
        asyncTest('自定义成功格式', function() {
            ajax.base({
                url: './define.php',
                rule: {
                    success: function(data) {
                        return true; // 只要服务器响应正常就认为是true
                    }
                },
                success: function(data) {
                    equal(data.name, 'tom');
                    start();
                }
            });
        });
        asyncTest('逻辑判定错误', function() {
            var flag = false;
            ajax.base({
                url: './error.php',
                error: function(data) {
                    equal(data.data, 'sorry');
                    ajax.setErrorAction(function() {
                        flag = true;
                    });
                    ajax.base({
                        url: './error.php',
                        complete: function() {
                            ok(flag);
                            start();
                        }
                    });
                }
            });
        });
        asyncTest('server error', function() {
            var obj = {
                url: './500.php'
            };
            if(window._phantom) {
                obj.complete = function() { // phamtomJS对服务端返回500会认为是abort
                    ok(true);
                    start();
                };
            } else {
                obj.error = function(data) {
                    ok(true);
                    start();
                };
            }
            ajax.base(obj);
        });
        asyncTest('abort', function() {
            var xhr = ajax.base({
                url: './delay.php',
                error: function(data) {
                    ok(false);
                    start();
                },
                complete: function() {
                    ok(true);
                    start();
                }
            });
            xhr.abort();
        });

        module('ajax single');
        asyncTest('resend same', function() {
            var req = ajax.single('same');
            var fn = function(i) {
                req.send({
                    url: './200.php',
                    success: function(data) {
                        equal(1, i);
                        start();
                    }
                });
            };
            fn(1);
            fn(2); // not use
            fn(3); // not use
        });
        asyncTest('resend different', function() {
            var req = ajax.single('different');
            var fn = function(i) {
                req.send({
                    url: './200.php',
                    data: {
                        random: +new Date() + Math.random()
                    },
                    success: function(data) {
                        equal(3, i);
                        start();
                    }
                });
            };
            fn(1); // abort
            fn(2); // abort
            fn(3);
        });
    });
});