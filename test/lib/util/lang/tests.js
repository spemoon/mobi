/**
 * User: caolvchong@gmail.com
 * Date: 4/10/13
 * Time: 3:21 PM
 */

seajs.use(['../../../../js/lib/util/lang'], function(lang) {

    module('类型判断');
    var multiTypeData = {
        'undefined': [(function() {})()],
        'null': null,
        number: [-1, 0, 1, 1 - 's'],
        string: ['s', '0', '1', '', ' '],
        boolean: [true, false],
        object: [
            {},
            {name: 1},
            window
        ],
        array: [
            [],
            [1, 2, 3]
        ],
        function: [(function() {})],
        regexp: [/\s+/g, new RegExp('\s+', 'g')]
    };
    test('isFunction', function() {
        lang.each(multiTypeData, function(arr, key) {
            lang.each(arr, function(val, i) {
                if(key === 'function') {
                    ok(lang.isFunction(val));
                } else {
                    ok(!lang.isFunction(val));
                }
            });
        });
    });
    test('isArray', function() {
        lang.each(multiTypeData, function(arr, key) {
            lang.each(arr, function(val, i) {
                if(key === 'array') {
                    ok(lang.isArray(val));
                } else {
                    ok(!lang.isArray(val));
                }
            });
        });
    });
    test('isUndefined', function() {
        lang.each(multiTypeData, function(arr, key) {
            lang.each(arr, function(val, i) {
                if(key === 'undefined') {
                    ok(lang.isUndefined(val));
                } else {
                    ok(!lang.isUndefined(val));
                }
            });
        });
    });

    module('函数增强');
    test('bind', function() {
        var scope = {
            name: 'Tom'
        };
        equal(lang.bind(function() {
            return this.name;
        }, scope)(), scope.name);
        equal(lang.bind(function(s1, s2) {
            return [this.name, s1, s2].join('+');
        }, scope)('Jerry', 'Lily'), 'Tom+Jerry+Lily');
    });
    asyncTest('delay', 2, function() {
        var flag = false;
        lang.delay(function() {
            flag = true;
            ok(flag);
            start();
        }, 1000);
        equal(flag, false);
    });
    asyncTest('delay 2', 2, function() {
        lang.delay(function(s1, s2) {
            equal(s1, 'hello');
            equal(s2, 'world');
            start();
        }, 1000, 'hello', 'world');
    });
    asyncTest('defer', 2, function() {
        lang.defer(function(s1, s2) {
            equal(s1, 'hello');
            equal(s2, 'world');
            start();
        }, 'hello', 'world');
    });
    asyncTest('throttle', 3, function() {
        var i = 0;
        var fn = lang.throttle(function() {
            i++;
        }, 1000);
        equal(i, 0);
        fn(); // 有效
        fn(); // 无效
        fn(); // 无效
        fn(); // 有效，但要隔1秒后触发
        equal(i, 1);
        setTimeout(function() {
            equal(i, 2);
            start();
        }, 1500);
    });
    asyncTest('throttle 2', 9, function() {
        var i = 0;
        var result;
        var fn = lang.throttle(function(s) {
            i++;
            result = s;
            return s;
        }, 1000);
        equal(i, 0);
        equal(fn('a'), 'a'); // 有效
        equal(fn('b'), 'a'); // 无效
        equal(fn('c'), 'a'); // 无效
        equal(fn('d'), 'a'); // 有效，但要隔1秒后触发，因此返回值是a
        equal(i, 1);
        setTimeout(function() {
            equal(i, 2);
            equal(result, 'd');
            setTimeout(function() {
                equal(fn('e'), 'e'); // 有效
                start();
            }, 2000);
        }, 1500);
    });
    asyncTest('debounce', 5, function() {
        var i = 0;
        var result;
        var fn = lang.debounce(function(s) {
            result = s;
            i++;
        }, 1000);
        equal(i, 0);
        fn('a'); // 无效
        fn('b'); // 无效
        fn('c'); // 无效
        fn('d'); // 有效，但要1秒后触发
        equal(i, 0);
        ok(lang.isUndefined(result));
        setTimeout(function() {
            equal(i, 1);
            equal(result, 'd');
            start();
        }, 1500);
    });
    asyncTest('debounce 2', 7, function() {
        var i = 0;
        var result;
        var fn = lang.debounce(function(s) { // 第三个为true，第一个会立即触发
            i++;
            result = s;
            return s;
        }, 1000, true);
        equal(i, 0);
        equal(fn('a'), 'a'); // 有效，被立即触发
        equal(fn('b'), 'a'); // 无效
        equal(fn('c'), 'a'); // 无效
        equal(fn('d'), 'a'); // 无效
        equal(i, 1);
        setTimeout(function() {
            equal(i, 1);
            start();
        }, 1500);
    });
    test('once', function() {
        var i = 0;
        var fn = lang.once(function(s) {
            i++;
            return s;
        });
        var s1 = fn('hello');
        var s2 = fn('world');
        equal(s1, 'hello');
        equal(s2, 'hello');
        equal(i, 1);
    });
    test('wrap', function() {
        var i = 0;
        var fn = function(flag) {
            if(flag) {
                i++;
            }
        };
        var wrap = lang.wrap(fn, function(fn, a, b) {
            fn(a > b);
        });
        wrap(1, 2);
        equal(i, 0);
        wrap(1, 1);
        equal(i, 0);
        wrap(2, 1);
        equal(i, 1);
    });
    test('result', function() {
        var obj = {
            name: 'obj',
            age: 22,
            fn: function(a, b) {
                return a + b;
            }
        };
        equal(lang.result(obj, 'name'), 'obj');
        equal(lang.result(obj, 'age'), 22);
        equal(lang.result(obj, 'fn', 3, 4), 7);
        equal(lang.result(null), null);
        equal(lang.result('obj', 'name'), obj['undefined']);
    });

    module('数组增强');
    test('each', function() {
        var a = [1, 3, 5, 7, 9];
        lang.each(a, function(val, i, arr) {
            equal(val, i * 2 + 1);
        });

        var n = 0;
        lang.each(a, function(val, i, arr) {
            n++;
            return val < 5;
        });
        equal(n, 3);

        var o = {
            name: 'tom',
            age: 22,
            sex: 1
        };
        lang.each(o, function(val, key, obj) {
            equal(val, obj[key]);
        });
    });
    test('indexOf', function() {
        var a = [1, 3, 5, '2', 4, 2, 1, 7];
        equal(lang.indexOf(a, 3), 1);
        equal(lang.indexOf(a, 2), 5);
        equal(lang.indexOf(a, 0), -1);
        equal(lang.indexOf(a, 1, 3), 6);
    });
    test('lastIndexOf', function() {
        var a = [1, 3, 5, '2', 4, 2, 1, 3, 7];
        equal(lang.lastIndexOf(a, 2), 5);
        equal(lang.lastIndexOf(a, 0), -1);
        equal(lang.lastIndexOf(a, 1), 6);
        equal(lang.lastIndexOf(a, 1, 3), 0);
        equal(lang.lastIndexOf(a, 1, 6), 6);
        equal(lang.lastIndexOf(a, 3), 7);
        equal(lang.lastIndexOf(a, 3, 1), 1);
        equal(lang.lastIndexOf(a, 3, 0), -1);
    });

    module('对象增强');
    test('extend', function() {
        var o1 = {
            name: 'tom',
            age: 22,
            sex: 1
        };
        var d1 = lang.extend({}, o1);
        deepEqual(o1, d1);
        equal(o1.name, d1.name);

        var o2 = {
            name: 'tom',
            age: 22,
            fn: function() {},
            obj: {
                name: 'jerry',
                age: 25
            }
        };
        var d2 = lang.extend({}, o2);
        equal(o2.fn, d2.fn);
        strictEqual(o2.obj, d2.obj);

        var d3 = lang.extend(true, {}, o2);
        notEqual(o2.fn, d3.fn);
        notEqual(o2.obj, d3.obj);
        equal(o2.obj.name, d3.obj.name);

        var d4 = lang.extend(true, {}, o2, o1);
        equal(o1.name, d4.name);
        equal(o1.sex, d4.sex);
        equal(o2.obj.name, d4.obj.name);
    });
    test('clone', function() {
        var arr = [1, 3, 5, 7, 9];
        var o1 = {
            name: 'tom',
            age: 22,
            sex: 1
        };
        var o2 = {
            name: 'tom',
            age: 22,
            fn: function() {},
            obj: {
                name: 'jerry',
                age: 25
            }
        };
        var str = 'hello';

        var c1 = lang.clone(arr);
        equal(c1[2], arr[2]);

        var c2 = lang.clone(o1);
        equal(c2.name, o1.name);

        var c3 = lang.clone(o2);
        equal(c3.name, o2.name);
        strictEqual(c3.obj, o2.obj);

        var c4 = lang.clone(o2, true);
        equal(c4.name, o2.name);
        notEqual(c4.obj, o2.obj);
        equal(c4.obj.age, o2.obj.age);

        var c5 = lang.clone(str);
        equal(c5, str);
    });

    module('字符串增强');
    test('uniqueId', function() {
        equal(lang.uniqueId(), 1);
        equal(lang.uniqueId('pre'), 'pre2');
        equal(lang.uniqueId('test'), 'test3');
    });
    test('escape', function() {
        var str1 = 'tom&jerry <a href="http://www.baidu.com/?key=hello&time=123456" target="_blank">"你好+朋友\'</a>';
        var str2 = 'tom&amp;jerry &lt;a href=&quot;http:&#x2F;&#x2F;www.baidu.com&#x2F;?key=hello&amp;time=123456&quot; target=&quot;_blank&quot;&gt;&quot;你好+朋友&#x27;&lt;&#x2F;a&gt;';
        equal(str1, lang.unescape(str2));
        equal(str2, lang.escape(str1));
    });
    test('trim', function() {
        var str1 = '   hello    ';
        var str2 = '    jerry';
        var str3 = 'tom   ';
        equal(lang.trim(str1), 'hello');
        equal(lang.trim(str2), 'jerry');
        equal(lang.trim(str3), 'tom');
    });
    test('parseJSON', function() {
        var str1 = '{"name": "hello", "age": 123}';
        var o1 = lang.parseJSON(str1);
        equal(o1.name, 'hello');
        equal(o1.age, 123);

        var str2 = '{"name": "hello", "age": 123, "obj": {"inner": "good"}}';
        var o2 = lang.parseJSON(str2);
        equal(o2.obj.inner, 'good');

        var str3 = '[1, 3, {"name": "tom"}]';
        var o3 = lang.parseJSON(str3);
        equal(o3[1], 3);
        equal(o3[2].name, 'tom');

        var str4 = '{name: "hello"}';
        var str5 = 'not right';
        throws(function() {
            lang.parseJSON(str4);
        });
        throws(function() {
            lang.parseJSON(str5);
        });
    });
});