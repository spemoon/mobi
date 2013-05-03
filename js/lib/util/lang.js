define(function(require, exports, module) {
    var arrProto = Array.prototype;
    var objProto = Object.prototype;
    var fnProto = Function.prototype;
    var toString = objProto.toString;
    var slice = arrProto.slice;
    var push = arrProto.push;
    var nativeBind = fnProto.bind;
    var nativeIndexOf = arrProto.indexOf;
    var nativeLastIndexOf = arrProto.lastIndexOf;

    // 命名空间
    var ns = {};
    module.exports = ns;

    /**
     * 判断val是否是function
     * @param val
     * @returns {boolean}
     */
    ns.isFunction = function(val) {
        return typeof val === 'function';
    };
    /**
     * 判断val是否是Array
     * @type {boolean}
     */
    ns.isArray = Array.isArray || function(val) {
        return toString.call(val) === '[object Array]';
    };
    /**
     * 判断val是否是undefined
     * @param val
     * @returns {boolean}
     */
    ns.isUndefined = function(val) {
        return val === void 0;
    };

    /**
     * 给fn绑定作用域context，后续参数将作为fn的参数传入
     * @param fn
     * @param context
     * @returns {Function}
     */
    ns.bind = function(fn, context) {
        var result;
        if(fn.bind === nativeBind && nativeBind) {
            result = nativeBind.apply(fn, slice.call(arguments, 1));
        } else {
            var args = slice.call(arguments, 2);
            result = function() {
                return fn.apply(context, args.concat(slice.call(arguments)));
            };
        }
        return result;
    };
    /**
     * 延迟n毫秒执行fn，后续参数将作为fn的参数传入
     * @param fn
     * @param n
     * @returns {number}
     */
    ns.delay = function(fn, n) {
        var args = slice.call(arguments, 2);
        return setTimeout(function() {
            return fn.apply(null, args);
        }, n);
    };
    /**
     * 利用timer机制，有助于执行开销大的计算和无阻塞UI线程的HTML渲染
     * @param fn
     * @returns {number}
     */
    ns.defer = function(fn) {
        return ns.delay.apply(null, [fn, 1].concat(slice.call(arguments, 1)));
    };
    /**
     * 单位时间间隔wait 内最多只能执行一次fn
     * 如果单位时间内多次触发，接受第一次，此时第二次，第二次将在第一次执行完wait后执行
     * 若在第二次等待过程中，第三次进来，则第二次会被放弃（参数被替换）
     * 同理，多次进来，第一次执行后等待wait，执行的总是最后一次
     * @param fn
     * @param wait
     * @returns {Function}
     */
    ns.throttle = function(fn, wait) {
        var context, args, timeout, result;
        var previous = 0;
        var later = function() {
            previous = new Date();
            timeout = null;
            result = fn.apply(context, args);
        };
        return function() {
            var now = new Date();
            var remaining = wait - (now - previous);
            context = this;
            args = arguments; // 参数被替换，因此多次时候，等待的总是用最后一次
            if(remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = fn.apply(context, args);
            } else if(!timeout) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };
    /**
     * 单位时间wait 内触发多次fn的话，前面的fn将被清除，等待使用最后一次触发的fn
     * 如果immediate设置为true，则第一次会立即触发
     * @param fn
     * @param wait
     * @param immediate
     * @returns {Function}
     */
    ns.debounce = function(fn, wait, immediate) {
        var timeout, result;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if(!immediate) {
                    result = fn.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if(callNow) {
                result = fn.apply(context, args);
            }
            return result;
        };
    };
    /**
     * fn只执行一次，然后再调用会直接返回第一次执行的结果
     * @param fn
     * @returns {Function}
     */
    ns.once = function(fn) {
        var ran = false, memo;
        return function() {
            if(ran) {
                return memo;
            }
            ran = true;
            memo = fn.apply(this, arguments);
            fn = null;
            return memo;
        };
    };
    /**
     * 将fn包入wrapper，fn作为wrapper的第一个参数，这样可以达到切面的作用
     * @param fn
     * @param wrapper
     * @returns {Function}
     */
    ns.wrap = function(fn, wrapper) {
        return function() {
            var args = [fn];
            push.apply(args, arguments);
            return wrapper.apply(this, args);
        };
    };
    /**
     * obj[key]是function则执行并返回执行后的值，其他则直接返回
     * 与underscore不同的是，underscore不接受额外参数，这里第三个参数开始是传递给obj[key]的参数
     * @param obj
     * @param key
     * @returns {*}
     */
    ns.result = function(obj, key) {
        if(obj === null) {
            return null;
        } else {
            var value = obj[key];
            if(ns.isFunction(value)) {
                return value.apply(obj, slice.call(arguments, 2));
            } else {
                return value;
            }
        }
    };

    /**
     * 遍历数组或对象，逐个执行迭代器
     * @param obj
     * @param iterator 迭代器，参数为(当前元素，当前下标/key，整个数组/对象)
     *                 和underscore不同的是，返回false将中断遍历
     * @param context
     */
    ns.each = function(obj, iterator, context) {
        if(obj) {
            if(obj.length === +obj.length) {
                for(var i = 0, l = obj.length; i < l; i++) {
                    if(iterator.call(context, obj[i], i, obj) === false) {
                        return obj;
                    }
                }
            } else {
                for(var key in obj) {
                    if(iterator.call(context, obj[key], key, obj) === false) {
                        return obj;
                    }
                }
            }
        }
    };
    /**
     * 数组中顺序查找，找到返回下标，没找到返回-1，可以指定index表明从index下标开始往后查找
     * @param arr
     * @param item
     * @param index
     * @returns {number}
     */
    ns.indexOf = function(arr, item, index) {
        if(arr) {
            if(nativeIndexOf && arr.indexOf === nativeIndexOf) {
                return arr.indexOf(item, index);
            } else {
                var i = index || 0;
                for(var l = arr.length; i < l; i++) {
                    if(arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            }
        } else {
            return -1;
        }
    };
    /**
     * 数组中倒序查找，找到返回下标，没找到返回-1，可以指定index表明从index下标开始往前查找
     * @param arr
     * @param item
     * @param index
     * @returns {*}
     */
    ns.lastIndexOf = function(arr, item, index) {
        if(arr) {
            if(nativeLastIndexOf && arr.lastIndexOf === nativeLastIndexOf) {
                return arr.lastIndexOf(item, typeof index === 'number' ? index : -1);
            } else {
                var l = arr.length - 1;
                for(var i = Math.min(l, typeof index === 'number' ? index : l); i >= 0; i--) {
                    if(arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            }
        } else {
            return -1;
        }
    };

    (function() {
        /**
         * 私有方法，判断是否是Object
         * @param obj
         * @returns {boolean}
         */
        var isObject = function(obj) {
            return obj === Object(obj);
        };
        /**
         * 私有方法
         * 将source字段拷贝到target，deep为true时候为深拷贝
         * @param target
         * @param source
         * @param deep
         */
        var extend = function(target, source, deep) {
            for(var key in source) {
                var v1 = source[key];
                var v2 = target[key];
                if(deep && (isObject(v1) || ns.isArray(v1))) {
                    if(isObject(v1) && !isObject(v2)) {
                        target[key] = {};
                    }
                    if(ns.isArray(v1) && !ns.isArray(v2)) {
                        target[key] = [];
                    }
                    extend(target[key], v1, deep);
                } else if(!ns.isUndefined(v1)) {
                    target[key] = v1;
                }
            }
        };
        /**
         * 将后续参数拷贝到target，如果第一个参数是true表示是深度拷贝，此时target是第二个参数
         * @param target
         * @returns {*}
         */
        ns.extend = function(target) {
            var deep, args = slice.call(arguments, 1);
            if(typeof target === 'boolean') {
                deep = target;
                target = args.shift();
            }
            ns.each(args, function(arg) {
                extend(target, arg, deep);
            });
            return target;
        };
        /**
         * 拷贝一个对象，如果不是对象，则直接返回输入值。默认浅拷贝，deep为true为深拷贝
         * @param target
         * @param deep
         * @returns {*}
         */
        ns.clone = function(target, deep) {
            deep = !!deep;
            if(target === Object(target)) {
                return ns.isArray(target) ? target.slice() : ns.extend(deep, {}, target);
            } else {
                return target;
            }
        };
    })();

    /**
     * 生成一个唯一的id
     * @param prefix 前缀
     * @returns {string}
     */
    ns.uniqueId = (function(index) {
        return function(prefix) {
            var id = ++index + '';
            return prefix ? prefix + id : id;
        };
    })(0);
    /**
     * 转义/反转义 &><"'/这六个字符
     */
    (function(map) {
        var entityMap = {
            escape: map,
            unescape: {}
        };
        var arr = {
            escape: [],
            unescape: []
        };
        ns.each(map, function(val, key, map) {
            arr.escape.push(key);
            arr.unescape.push(val);
            entityMap.unescape[val] = key;
        });
        var reg = {
            escape: new RegExp('[' + arr.escape.join('') + ']', 'g'),
            unescape: new RegExp('(' + arr.unescape.join('|') + ')', 'g')
        };
        ns.each(['escape', 'unescape'], function(method) {
            ns[method] = function(str) {
                return ('' + str).replace(reg[method], function(match) {
                    return entityMap[method][match];
                });
            };
        });
    })({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#x27;',
        '/': '&#x2F;'
    });
    /**
     * 消除字符串两边的空白
     * @param str
     * @returns {*}
     */
    ns.trim = function(str) {
        if(typeof str === 'string') {
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
        } else {
            return str;
        }
    };
    /**
     * 将字符串解析为JSON对象
     */
    ns.parseJSON = (function() {
        var rvalidchars = /^[\],:{}\s]*$/;
        var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
        var rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g;
        var rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
        return function(data) {
            if(window.JSON && window.JSON.parse) {
                return window.JSON.parse(data);
            }
            if(data === null) {
                return data;
            }
            if(typeof data === 'string') {
                data = ns.trim(data);
                if(data) {
                    if(rvalidchars.test(data.replace(rvalidescape, '@').replace(rvalidtokens, ']').replace(rvalidbraces, ''))) {
                        return (new Function('return ' + data))();
                    }
                }
            }
            throw new Error('Invalid JSON: ' + data);
        };
    })();
});
