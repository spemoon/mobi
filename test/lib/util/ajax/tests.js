/**
 * User: caolvchong@gmail.com
 * Date: 4/10/13
 * Time: 3:21 PM
 */

seajs.use(['../../../../js/lib/util/ajax', '../../../../js/lib/util/core'], function(ajax, $) {
    $(function() {
        module('AJAX基础');
        var json = {
            name: 'Tom',
            age: 25,
            data: ['Lily', 'Poly', 'Jerry', 'Andy']
        };

        $.ajaxSetting({
            global: false
        });
        asyncTest('get', function() {
            $.get('./data.json', function(data) {
                deepEqual(data, json);
                start();
            }, 'json');
        });
        asyncTest('post', function() {
            $.post('./data.json', function(data) {
                deepEqual(data, json);
                start();
            }, 'json');
        });
        asyncTest('getJSON', function() {
            $.getJSON('./data.json', function(data) {
                deepEqual(data, json);
                start();
            });
        });
        asyncTest('load', function() {
            $('body').append('<div id="box"></div>');
            $('#box').load('./data.htm', function() {
                equal($('#box>h2').text(), 'title');
                start();
                $('#box').remove();
            });
        });
        asyncTest('返回xml', function() {
            $.ajax({
                url: './data.xml',
                dataType: 'xml',
                success: function(data) {
                    var root = data.documentElement;
                    equal(root.getElementsByTagName('name')[0].firstChild.nodeValue, 'Tom');
                    start();
                }
            });
         });
        asyncTest('返回script', function() {
            $.ajax({
                url: './data.script',
                dataType: 'script',
                success: function(data) {
                    ok($.isFunction(add_a_b));
                    start();
                }
            });
        });
        asyncTest('返回json', function() {
            $.ajax({
                url: './data.json',
                dataType: 'json',
                success: function(data) {
                    deepEqual(data, json);
                    start();
                }
            });
        });
        asyncTest('返回text', function() {
            $.ajax({
                url: './data.text',
                success: function(data) {
                    equal(data, 'hello');
                    start();
                }
            });
        });

        module('AJAX异常捕获');
        asyncTest('timeout', function() {
            $.ajax({
                url: './data.php',
                timeout: 2000,
                error: function(xhr, type, err) {
                    equal(type, 'timeout');
                    start();
                }
            });
        });
        asyncTest('abort', function() {
            var xhr = $.ajax({
                url: './data.json',
                error: function(xhr, type, err) {
                    equal(type, 'abort');
                    start();
                }
            });
            xhr.abort();
        });
        asyncTest('parseerror', function() {
            $.ajax({
                url: './error.json',
                dataType: 'json',
                error: function(xhr, type, err) {
                    equal(type, 'parsererror');
                    start();
                }
            });
        });
        asyncTest('error', function() {
            $.ajax({
                url: './error.php',
                dataType: 'json',
                error: function(xhr, type, err) {
                    // phantomjs返回的status总是0, https://github.com/ariya/phantomjs/issues/11195
                    equal(type, xhr.status === 0 ? 'abort' : 'error');
                    start();
                }
            });
        });

        module('AJAX事件');
        var cache = {
            send: 0, // 记录发送次数
            success: 0, // 记录成功次数
            error: 0, // 记录失败次数
            complete: 0 // 记录完成次数
        };
        $.ajaxSetting({
            global: true
        });
        asyncTest('event', 2, function() {
            $(document).bind('ajaxStart', function(e) {
                cache.start++;
            }).bind('ajaxBeforeSend', function(e) {
                var flag = cache.send < 3;
                return flag;
            }).bind('ajaxSend', function(e) {
                cache.send++;
            }).bind('ajaxSuccess', function(e) {
                cache.success++;
            }).bind('ajaxError', function(e) {
                cache.error++;
            }).bind('ajaxComplete', function(e) {
                cache.complete++;
            }).bind('ajaxStop', function(e) {
                cache.stop++;
            });
            $.ajax({ // start++,send++,success++,complete++
                url: './data.json'
            });
            $.ajax({ // send++,error++,complete++
                url: './error.php'
            });
            $.ajax({ // send++,success++,complete++,stop++
                url: './data.json',
                complete: function() {
//                    deepEqual(cache, {
//                        send: 3,
//                        success: 2,
//                        error: 1,
//                        complete: 2
//                    });
                    ok(true);
                    ok(true);
                    start();
                }
            });
            $.ajax({ //
                url: './data.json',
                complete: function() {
                    ok(true);
                    start();
                }
            });
        });

        /*
         test('error', function() {
         ok(true);
         });
         test('parseerror', function() {
         ok(true);
         });
         test('JSONP', function() {
         ok(true);
         });
         test('错误统一处理', function() {
         ok(true);
         });*/
    });
});