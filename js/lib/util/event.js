/**
 * 事件系统，由zepto事件系统改造而来
 * User: caolvchong@gmail.com
 * Date: 4/16/13
 * Time: 11:04 AM
 */
define(function(require, exports, module) {
    var $ = require('./core');
    var lang = require('./lang');
    /**
     * 事件缓存，缓存的key是zid，值是一个数组，数组的每个元素有以下结构
     {
         e: 事件类型,字符串
         ns: 事件命名空间,字符串
         fn: 事件处理函数,函数
         sel: 指定的选择器,字符串或者zepto对象
         del: 指定的代理函数，可能是false
         proxy:
         i: 当前元素在数组中的位置
     }
     handles[zid(obj)]可以得到该obj上绑定的所有事件(obj具有属性_zid)
     */

    var handlers = {};

    // 某个对象的事件id标识
    var _zid = 1;

    // mouseenter/mouseleave仅IE下支持，其他需要mouseover和mouseout来模拟
    var hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' };

    /**
     * 如果obj对象不存在_zid属性则增加该属性，然后返回_zid
     * 如果存在，则直接返回
     * @param obj
     * @returns number
     */
    function zid(obj) {
        return obj._zid || (obj._zid = _zid++);
    }

    /**
     * 格式化事件类型，将其由字符串转化为一定格式的对象
     * @param event 字符串，存在命名空间的话，用.号分隔，第一个是事件类型，后面是命名空间
     * @returns {e: string, ns: string}
     */
    function parse(event) {
        var parts = ('' + event).split('.');
        return {
            e: parts[0],
            ns: parts.slice(1).sort().join(' ')
        };
    }

    /**
     * 生成命名空间的正则，例如：
     * 'click.hello.world' 命名空间是hello.world，对应的正则表达式为： /(?:^| )hello .* ?world(?: |$)/
     * @param ns 命名空间字符串
     * @returns {RegExp}
     */
    function matcherFor(ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
    }

    /**
     * 查找绑定在元素上的指定类型的事件处理函数集合
     * @param element 绑定的节点
     * @param event 事件类型字符串
     * @param fn 指定的回调函数
     * @param selector 选择器
     * @returns {Array}
     */
    function findHandlers(element, event, fn, selector) {
        event = parse(event);
        if(event.ns) {
            var matcher = matcherFor(event.ns); // 事件命名空间的正则表达式
        }
        return (handlers[zid(element)] || []).filter(function(handler) {
            // handler.e == event.e 事件类型相同
            // matcher.test(handle.ns) 事件命名空间相同
            // zid(handler.fn) 给handler.fn增加一个zid属性（第一次没有，后面直接获取），zid(fn) 如果 handler.fn === fn 则必然是获取zid
            return handler && (!event.e || handler.e === event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || zid(handler.fn) === zid(fn)) && (!selector || handler.sel === selector);
        });
    }

    /**
     * 遍历events，对其进行迭代
     * @param events 事件类型，一般有两种格式：
     *          1. 字符串，多个事件使用空格分割，比如： 'click',  'click hover'
     *          2. 对象，key是事件类型，value是事件处理函数
     * @param fn 事件处理函数
     * @param iterator 事件迭代器，参数是(event, fn)
     */
    function eachEvent(events, fn, iterator) {
        if(typeof events !== 'string') {
            $.each(events, iterator);
        } else {
            lang.each(events.split(/\s/), function(type) {
                iterator(type, fn);
            });
        }
    }

    /**
     * 返回事件类型，主要修复mouseenter/mouseleave
     * 如果是mouseenter则转化为mouseover
     * 如果是mouseleave则转化为mouseout
     * 其他直接返回
     * @param type
     * @returns {*}
     */
    function realEvent(type) {
        return hover[type] || type;
    }

    /**
     * 通过给focus和blur事件设置为捕获来达到事件冒泡的目的
     * @param handler
     * @param captureSetting
     * @returns {*|boolean|boolean}
     */
    function eventCapture(handler, captureSetting) {
        return handler.del && (handler.e === 'focus' || handler.e === 'blur') || !!captureSetting;
    }

    /**
     * 给element绑定事件
     * @param element 绑定事件的节点
     * @param events 事件类型（字符串或数组）
     * @param fn 事件处理函数
     * @param selector 选择器，解绑时候会用到
     * @param getDelegate 委托函数，返回的是一个函数
     * @param capture 是否使用捕获
     */
    function add(element, events, fn, selector, getDelegate, capture) {
        var id = zid(element); // 得到zid
        var set = (handlers[id] || (handlers[id] = [])); // 如果存在缓存（该节点被处理过事件），则直接取出，否则新建一个数组作为缓存
        eachEvent(events, fn, function(event, fn) {
            var handler = parse(event); // 格式化为 {e: 事件类型, ns: 事件命名空间}
            handler.fn = fn; // 事件处理函数
            handler.sel = selector;
            if(handler.e in hover) { // 事件类型是mouseenter或者mouseleave
                // relatedTarget为事件相关对象，只有在mouseover和mouseout事件时才有值
                // mouseover时表示的是鼠标移出的那个对象，mouseout时表示的是鼠标移入的那个对象
                // 当related不存在，表示事件不是mouseover
                // mouseout,mouseover时!$.contains(this, related)当相关对象不在事件对象内且related !== this相关对象不是事件对象时
                // 表示鼠标已经从事件对象外部移入到了对象本身，这个时间是要执行处理函数的
                // 当鼠标从事件对象上移入到子节点的时候related就等于this了，且!$.contains(this, related)也不成立，这个时间是不需要执行处理函数的
                fn = function(e) {
                    var related = e.relatedTarget;
                    if(!related || (related !== this && !$.contains(this, related))) { // 离开了节点，则直接执行
                        return handler.fn.apply(this, arguments);
                    }
                };
            }
            handler.del = getDelegate && getDelegate(fn, event); // 委托
            var callback = handler.del || fn; // 有提供委托用委托，没有用事件回调处理
            handler.proxy = function(e) {
                var result = callback.apply(element, [e].concat(e.data));
                if(result === false) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return result;
            };
            handler.i = set.length; // 当前处理的事件在缓存中的位置
            set.push(handler); // 将当前事件处理推入缓存
            element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
        });
    }

    /**
     * 移除事件
     * @param element 移除事件的对象
     * @param events 事件类型
     * @param fn 如果指定，则移除该函数的事件绑定，不指定，则移除该事件的所有绑定
     * @param selector 选择器，解除委托绑定时候会用到
     * @param capture 是否使用捕获
     */
    function remove(element, events, fn, selector, capture) {
        var id = zid(element);
        eachEvent(events || '', fn, function(event, fn) {
            lang.each(findHandlers(element, event, fn, selector), (function(handler) {
                delete handlers[id][handler.i];
                element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
            }));
        });
    }

    /**
     * 扩展$
     */
    (function() {
        var returnTrue = function() {
            return true;
        };
        var returnFalse = function() {
            return false;
        };

        // 忽略的属性，以大写A-Z开头的属性或者以layerX/layerY结尾的属性
        var ignoreProperties = /^([A-Z]|layer[XY]$)/;
        var eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
        };

        /**
         * 格式化事件对象
         */
        var createProxy = function(event) {
            var key;
            var proxy = {
                originalEvent: event // 原生事件引用
            };
            for(key in event) { // 复制属性
                if(!ignoreProperties.test(key) && event[key] !== undefined) {
                    proxy[key] = event[key];
                }
            }
            // 添加三个方法 preventDefault/stopImmediatePropagation/stopPropagation
            lang.each(eventMethods, function(predicate, name) {
                proxy[name] = function() {
                    this[predicate] = returnTrue;
                    return event[name].apply(event, arguments);
                };
                proxy[predicate] = returnFalse;
            });
            return proxy;
        };

        /**
         * 当事件中没有defalutPrevented属性时候，模仿一个
         * @param event
         */
        var fix = function(event) {
            if(!('defaultPrevented' in event)) {
                event.defaultPrevented = false;
                var prevent = event.preventDefault;
                event.preventDefault = function() {
                    this.defaultPrevented = true;
                    prevent.call(this);
                };
            }
        };

        var specialEvents = {};
        specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';
        /**
         * 定义事件
         * @param type
         * @param props
         * @returns {Event}
         */
        var Event = function(type, props) {
            if(typeof type !== 'string') {
                props = type;
                type = props.type;
            }
            var event = document.createEvent(specialEvents[type] || 'Events');
            var bubbles = true;
            if(props) {
                for(var name in props) {
                    if(name === 'bubbles') {
                        bubbles = !!props[name];
                    } else {
                        event[name] = props[name];
                    }
                }
            }
            event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null);
            event.isDefaultPrevented = function() {
                return this.defaultPrevented;
            };
            return event;
        };
        $.Event = Event;

        lang.extend($.fn, {
            /**
             * 给节点绑定事件
             * @param event 事件类型，多事件由空格分隔
             * @param callback 响应事件的回调函数
             */
            bind: function(event, callback) {
                return this.each(function() {
                    add(this, event, callback);
                });
            },
            /**
             * 给节点解绑事件
             * @param event 事件类型，没有指定则移除所有事件
             * @param callback 指定的回调函数，没有指定则移除该事件类型的所有绑定
             */
            unbind: function(event, callback) {
                return this.each(function() {
                    remove(this, event, callback);
                });
            },
            /**
             * 一次性事件
             * @param event 事件类型
             * @param callback 事件回调函数
             */
            one: function(event, callback) {
                return this.each(function(i, element) {
                    add(this, event, callback, null, function(fn, type) {
                        return function() {
                            var result = fn.apply(element, arguments);
                            remove(element, type, fn); // 解绑
                            return result;
                        };
                    });
                });
            },
            /**
             * 绑定事件，该事件利用冒泡，仅在当前节点下满足selector选择器和event事件类型时候触发callback
             * @param selector 选择器
             * @param event 事件类型
             * @param callback 回调函数
             */
            delegate: function(selector, event, callback) {
                return this.each(function(i, element) {
                    add(element, event, callback, selector, function(fn) {
                        return function(e) {
                            var evt;
                            var match = $(e.target).closest(selector, element).get(0); // 指定的事件源节点
                            if(match) {
                                evt = $.extend(createProxy(e), {
                                    currentTarget: match,
                                    liveFired: element
                                });
                                return fn.apply(match, [evt].concat([].slice.call(arguments, 1)));
                            }
                        };
                    });
                });
            },
            /**
             * 解绑事件
             * @param selector
             * @param event
             * @param callback
             * @returns {*}
             */
            undelegate: function(selector, event, callback) {
                return this.each(function() {
                    remove(this, event, callback, selector);
                });
            },
            /**
             * 在document.body上监听，如果是当前选择器触发则响应事件
             * @param event
             * @param callback
             */
            live: function(event, callback) {
                $(document.body).delegate(this.selector, event, callback);
                return this;
            },
            /**
             * 对live的解绑
             * @param event
             * @param callback
             */
            die: function(event, callback) {
                $(document.body).undelegate(this.selector, event, callback);
                return this;
            },
            /**
             * 没有提供selector或者selector是function时候，给当前节点绑定事件
             * 如果提供了selector且不是function，则表明是用代理绑定
             * @param event
             * @param selector
             * @param callback
             */
            on: function(event, selector, callback) {
                return !selector || $.isFunction(selector) ? this.bind(event, selector || callback) : this.delegate(selector, event, callback);
            },
            /**
             * 与on相对应，解绑事件
             * @param event
             * @param selector
             * @param callback
             */
            off: function(event, selector, callback) {
                return !selector || $.isFunction(selector) ? this.unbind(event, selector || callback) : this.undelegate(selector, event, callback);
            },
            /**
             * 触发事件
             * @param event
             * @param data
             */
            trigger: function(event, data) {
                if(typeof event === 'string' || $.isPlainObject(event)) {
                    event = Event(event);
                }
                fix(event);
                event.data = data;
                return this.each(function() {
                    if('dispatchEvent' in this) {
                        this.dispatchEvent(event);
                    }
                });
            }
        });

        /**
         * 常规DOM事件的快速写法支持
         */
        lang.each(('focusin focusout load resize scroll unload click dblclick ' + 'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' + 'change select keydown keypress keyup error').split(' '), function(event) {
            $.fn[event] = function(callback) {
                return callback ? this.bind(event, callback) : this.trigger(event);
            };
        });
        lang.each(['focus', 'blur'], function(name) {
            $.fn[name] = function(callback) {
                if(callback) {
                    this.bind(name, callback);
                } else {
                    this.each(function() {
                        try {
                            this[name]();
                        } catch(e) {}
                    });
                }
                return this;
            };
        });
    })();

    module.exports = $;
});