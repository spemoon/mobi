/**
 * AJAX基础功能
 * User: caolvchong@gmail.com
 * Date: 4/23/13
 * Time: 11:06 AM
 */
define(function(require, exports, module) {
    var $ = require('./core');
    var event = require('./event');

    var undef;
    var jsonpID = 0; // jsonp的标识
    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    var scriptTypeRE = /^(?:text|application)\/javascript/i;
    var xmlTypeRE = /^(?:text|application)\/xml/i;
    var jsonType = 'application/json';
    var htmlType = 'text/html';
    var blankRE = /^\s*$/;
    var empty = function() {};

    // 默认AJAX设置
    var ajaxSettings = {
        // 请求类型
        type: 'GET',
        // 发送请求之前的回调
        beforeSend: empty,
        // 请求得到200响应后的回调
        success: empty,
        // 请求得到非200响应后的回调
        error: empty,
        // 请求完成后的回调，无论success还是error
        complete: empty,
        // 回调的作用域
        context: null,
        // 是否触发全局事件
        global: true,
        // XHR对象
        xhr: function() {
            return new window.XMLHttpRequest();
        },
        // MIME 类型映射
        accepts: {
            script: 'text/javascript, application/javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        // 是否跨域
        crossDomain: false,
        // 默认超时时间
        timeout: 0,
        // 是否序列化请求对象
        processData: true,
        // AJAX请求缓存
        cache: true
    };

    /**
     * 触发自定义事件
     * @param context 节点，默认document
     * @param eventName 事件名
     * @param data 数据
     * @returns {boolean}
     */
    var triggerAndReturn = function(context, eventName, data) {
        var event = $.Event(eventName);
        $(context).trigger(event, data);
        return !event.defaultPrevented;
    };

    /**
     * 触发AJAX相对应的事件
     * @param settings 当前ajax的配置
     * @param context 节点，默认document
     * @param eventName 事件名，包括 ajaxBeforeSend/ajaxSend/ajaxStart/ajaxSuccess/ajaxError/ajaxComplete/ajaxStop
     * @param data 数据
     * @returns {boolean}
     */
    var triggerGlobal = function(settings, context, eventName, data) {
        if(settings.global) {
            return triggerAndReturn(context || document, eventName, data);
        }
    };
    var activeCount = 0; // 当前活跃的AJAX请求数
    var trigger = {
        /**
         * 发送请求前的回调和事件，返回false则取消AJAX/JSONP请求，否则触发ajaxSend事件
         * @param xhr
         * @param settings
         * @returns {boolean}
         */
        before: function(xhr, settings) {
            var context = settings.context;
            if(settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false) {
                activeCount--;
                return false;
            }
            triggerGlobal(settings, context, 'ajaxSend', [xhr, settings]);
        },
        /**
         * AJAX发送请求开始的回调
         * @param settings
         */
        start: function(settings) {
            if(settings.global && activeCount++ === 0) {
                triggerGlobal(settings, null, 'ajaxStart');
            }
        },
        success: function(data, xhr, settings) {
            var context = settings.context;
            var status = 'success';
            settings.success.call(context, data, status, xhr);
            triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data]);
            trigger.complete(status, xhr, settings);
        },
        /**
         * AJAX请求错误时候的回调，错误可能是：timeout/error/abort/parsererror
         * @param error 错误对象
         * @param type 错误类型 timeout/error/abort/parsererror
         * @param xhr
         * @param settings
         */
        error: function(error, type, xhr, settings) {
            var context = settings.context;
            settings.error.call(context, xhr, type, error);
            triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error]);
            trigger.complete(type, xhr, settings);
        },
        /**
         * 无论AJAX成功还是失败，请求完成后都将触发
         * @param status 请求完成后的状态：success/notmodified/error/timeout/abort/parsererror
         * @param xhr
         * @param settings
         */
        complete: function(status, xhr, settings) {
            var context = settings.context;
            settings.complete.call(context, xhr, status);
            triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings]);
            trigger.stop(settings);
        },
        /**
         * 停止请求
         * @param settings
         */
        stop: function(settings) {
            if(settings.global && !(--activeCount)) {
                triggerGlobal(settings, null, 'ajaxStop');
            }
        }
    };

    /**
     * 根据mime得到格式 html/json/script/xml/text
     * @param mime
     */
    var mimeToDataType = function(mime) {
        if(mime) {
            mime = mime.split(';', 2)[0];
        }
        return mime && ( mime === htmlType ? 'html' : mime === jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml' ) || 'text';
    };

    /**
     * 在url后面拼接查询参数
     * @param url
     * @param query
     */
    var appendQuery = function(url, query) {
        url += url.indexOf('?') === -1 ? '?' : '&';
        return url + query;
    };
    /**
     * 序列化参数
     * @param options
     */
    var serializeData = function(options) {
        // options.data不是字符串时候，将其序列化为字符串
        if(options.processData && options.data && typeof options.data !== 'string') {
            options.data = $.param(options.data, options.traditional);
        }
        // get请求将data拼接到URL中
        if(options.data && (!options.type || options.type.toUpperCase() === 'GET')) {
            options.url = appendQuery(options.url, options.data);
        }
    };
    var serialize = function(params, obj, traditional, scope) {
        var isArray = $.isArray(obj);
        $.each(obj, function(key, value) {
            if(scope) {
                key = traditional ? scope : scope + '[' + (isArray ? '' : key) + ']';
            }
            if(!scope && isArray) {
                params.add(value.name, value.value);
            } else if(isArray || (!traditional && typeof value === 'object')) {
                serialize(params, value, traditional, key);
            } else {
                params.add(key, value);
            }
        });
    };
    /**
     * 格式化参数为AJAX指定的参数格式
     * @param url
     * @param data
     * @param success
     * @param dataType
     */
    var parseArguments = function(url, data, success, dataType) {
        var hasData = !$.isFunction(data); // data非函数
        return {
            url: url,
            data: hasData ? data : undef, // data为function时候表示没有传递参数
            success: !hasData ? data : $.isFunction(success) ? success : undef, // data是函数则为成功回调，不是函数则看success
            dataType: hasData ? dataType || success : success // data不是函数先看dataType，再看success；data是函数，直接用success作为返回值类型
        };
    };

    var escape = encodeURIComponent;

    var r = {
        /**
         * 设定AJAX的默认设置
         * @param settings
         */
        ajaxSetting: function(settings) {
            $.extend(ajaxSettings, settings);
        },
        /**
         * 将对象转化为字符串查询参数
         * @param obj 要序列化的对象
         * @param traditional 是否用传统方式序列化
         *        例如序列化：{a:[1,2,3]}
         *        传统方式得到：a=1&a=2&a=3
         *        非传统方式得到：a[]=1&a[]=2&a[]=3
         * @returns {string}
         */
        param: function(obj, traditional) {
            var params = [];
            params.add = function(k, v) {
                this.push(escape(k) + '=' + escape(v));
            };
            serialize(params, obj, traditional);
            return params.join('&').replace(/%20/g, '+');
        },
        /**
         * JSONP
         * @param options
         */
        ajaxJSONP: function(options) {
            if(!('type' in options)) {
                return $.ajax(options);
            }

            var callbackName = 'jsonp' + (++jsonpID);
            var script = document.createElement('script');
            var cleanup = function() {
                clearTimeout(abortTimeout);
                $(script).remove();
                delete window[callbackName];
            };
            var abort = function(type) {
                cleanup();
                // 主动放弃请求或者超时回调都会执行从而造成报错，因此重写为空函数
                if(!type || type === 'timeout') {
                    window[callbackName] = empty;
                }
                trigger.error(null, type || 'abort', xhr, options);
            };
            var xhr = {
                abort: abort
            };
            var abortTimeout;

            if(trigger.before(xhr, options) === false) {
                abort('abort');
                return false;
            }

            window[callbackName] = function(data) {
                cleanup();
                trigger.success(data, xhr, options);
            };

            script.onerror = function() {
                abort('error');
            };

            script.src = options.url.replace(/=\?/, '=' + callbackName);
            $('head').append(script);

            if(options.timeout > 0) {
                abortTimeout = setTimeout(function() {
                    abort('timeout');
                }, options.timeout);
            }

            return xhr;
        },
        /**
         * AJAX 核心
         * @param options
         *          crossDomain: 是否跨域，默认false
         *          url: 请求地址
         *          cache: 是否缓存，默认false
         *          dataType: 返回数据类型，有xml/text/script/json，默认text
         *          data: 请求参数
         *          type: 请求类型，默认GET
         *          headers: 请求头
         *          async: 是否异步，默认true
         *          timeout: 超时时间，默认0，宿主默认超时时间
         *          回调
         *              beforeSend: 返回false则不发送ajax请求
         *              success: 成功
         *              error: 失败
         *              complete: 完成
         *          触发事件
         *              ajaxStart: 全局开始第一个ajax请求，事件之后触发beforeSend
         *              ajaxBeforeSend: 返回false则不发送ajax请求
         *              ajaxSend: 发送请求事件
         *              ajaxSuccess: 事件之前触发success回调，事件之后触发ajaxComplete事件
         *              ajaxError: 事件之前触发error回调，事件之后触发ajaxComplete事件
         *              ajaxComplete: 事件之前触发complete回调，事件之后触发ajaxStop全局事件
         *              ajaxStop: 全局结束最后一个ajax请求
         *
         */
        ajax: function(options) {
            // 配置
            var settings = $.extend({}, options || {});
            for(var key in ajaxSettings) {
                if($.isUndefined(settings[key])) {
                    settings[key] = ajaxSettings[key];
                }
            }

            // 触发ajaxStart事件
            trigger.start(settings);

            if(!settings.crossDomain) {
                settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) && RegExp.$2 !== window.location.host;
            }
            if(!settings.url) {
                settings.url = window.location.toString();
            }

            // 请求参数序列化
            serializeData(settings);

            if(settings.cache === false) {
                settings.url = appendQuery(settings.url, '_=' + Date.now());
            }

            var dataType = settings.dataType;
            var hasPlaceholder = /=\?/.test(settings.url);
            if(dataType === 'jsonp' || hasPlaceholder) {
                if(!hasPlaceholder) {
                    settings.url = appendQuery(settings.url, 'callback=?');
                }
                return $.ajaxJSONP(settings);
            }

            var mime = settings.accepts[dataType];
            var baseHeaders = {};
            var protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol;
            var xhr = settings.xhr();
            var abortTimeout;

            // 头处理
            if(!settings.crossDomain) {
                baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
            }
            if(mime) {
                baseHeaders.Accept = mime;
                if(mime.indexOf(',') > -1) {
                    mime = mime.split(',', 2)[0];
                }
                if(xhr.overrideMimeType) {
                    xhr.overrideMimeType(mime);
                }
            }
            if(settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() !== 'GET')) {
                baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded');
            }
            settings.headers = $.extend(baseHeaders, settings.headers || {});

            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4) {
                    xhr.onreadystatechange = empty;
                    clearTimeout(abortTimeout);
                    var result;
                    var error = false;
                    if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && protocol === 'file:')) {
                        dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'));
                        result = xhr.responseText;

                        try {
                            // http://perfectionkills.com/global-eval-what-are-the-options/
                            if(dataType === 'script') {
                                var g = (1, eval);
                                g(result);
                            } else if(dataType === 'xml') {
                                result = xhr.responseXML;
                            } else if(dataType === 'json') {
                                result = blankRE.test(result) ? null : $.parseJSON(result);
                            }
                        } catch(e) {
                            error = e;
                        }

                        if(error) {
                            trigger.error(error, 'parsererror', xhr, settings);
                        } else {
                            trigger.success(result, xhr, settings);
                        }
                    } else {
                        trigger.error(null, xhr.status ? 'error' : 'abort', xhr, settings);
                    }
                }
            };

            var async = 'async' in settings ? settings.async : true;
            xhr.open(settings.type, settings.url, async);

            for(var name in settings.headers) {
                xhr.setRequestHeader(name, settings.headers[name]);
            }

            if(trigger.before(xhr, settings) === false) {
                xhr.abort();
                return false;
            }

            if(settings.timeout > 0) {
                abortTimeout = setTimeout(function() {
                    xhr.onreadystatechange = empty;
                    xhr.abort();
                    trigger.error(null, 'timeout', xhr, settings);
                }, settings.timeout);
            }

            xhr.send(settings.data ? settings.data : null);
            return xhr;
        },
        /**
         * get请求
         */
        get: function(url, data, success, dataType) {
            return $.ajax(parseArguments.apply(null, arguments));
        },
        /**
         * post请求
         */
        post: function(url, data, success, dataType) {
            var options = parseArguments.apply(null, arguments);
            options.type = 'POST';
            return $.ajax(options);
        },
        /**
         * ajax请求，返回数据格式为JSON
         */
        getJSON: function(url, data, success) {
            var options = parseArguments.apply(null, arguments);
            options.dataType = 'json';
            return $.ajax(options);
        }
    };

    $.extend($, r);
    /**
     * 某个节点直接载入AJAX返回的结果
     */
    $.fn.load = function(url, data, success) {
        if(!this.length) { // 没有节点
            return this;
        }
        var self = this;
        var parts = url.split(/\s/);
        var selector;
        var options = parseArguments(url, data, success);
        var callback = options.success;
        if(parts.length > 1) {
            options.url = parts[0];
            selector = parts[1];
        }
        options.success = function(response) {
            self.html(selector ? $('<div>').html(response.replace(rscript, '')).find(selector) : response);
            if(callback) {
                callback.apply(self, arguments);
            }
        };
        $.ajax(options);
        return this;
    };

    module.exports = $;
});