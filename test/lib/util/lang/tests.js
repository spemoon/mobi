/**
 * User: caolvchong@gmail.com
 * Date: 4/10/13
 * Time: 3:21 PM
 */

seajs.use(['../../../../js/lib/util/lang'], function(lang) {
    var multiTypeData = {
        undefined: [(function() {})()],
        null: null,
        number: [-1, 0, 1, 1 - 's', new Number(1)],
        string: ['s', '0', '1', '', ' ', new String(''), new String('s')],
        boolean: [true, false, new Boolean(true), new Boolean(false)],
        object: [
            {},
            {name: 1},
            window,
            new Object()
        ],
        array: [
            [],
            [1, 2, 3],
            new Array(),
            new Array(3),
            new Array(1, 2, 3)
        ],
        function: [function() {}, new Function()],
        regexp: [/\s+/g, new RegExp('\s+', 'g')]
    };

    module('类型判断');
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

    module('唯一id生成');
    test('uniqueId', function() {
        equal(lang.uniqueId(), 1);
        equal(lang.uniqueId('pre'), 'pre2');
        equal(lang.uniqueId('test'), 'test3');
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
        fn(); // 有效
        equal(i, 1);
        setTimeout(function() {
            equal(i, 2);
            start();
        }, 1500);
    });
});