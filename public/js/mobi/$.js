/**
 * 综合核心库文件,目前包括：
 *     lang.js
 *     core.js
 *     event.js
 *     ajax.js
 *     ajax_ext.js
 *     detect.js
 *     history.js
 * User: caolvchong@gmail.com
 * Date: 5/17/13
 * Time: 2:33 PM
 */
define("mobi/$", [ "./core", "./lang", "./event", "./ajax", "./ajax_ext", "./detect", "./history" ], function(require, exports, module) {
    var $ = require("./core");
    // 默认引入了lang.js
    var event = require("./event");
    // 默认注入$
    var ajax = require("./ajax");
    // 默认注入$
    var ajaxExt = require("./ajax_ext");
    $.ajaxExt = ajaxExt;
    var detect = require("./detect");
    // 默认注入$
    var history = require("./history");
    $.history = history;
    module.exports = $;
});

define("mobi/core", [ "./lang" ], function(require, exports, module) {
    var lang = require("./lang");
    var undefi, key, $, classList;
    var emptyArray = [];
    var slice = emptyArray.slice;
    var filter = emptyArray.slice;
    var document = window.document;
    var elementDisplay = {};
    var classCache = {};
    var getComputedStyle = document.defaultView.getComputedStyle;
    var cssNumber = {
        "column-count": 1,
        columns: 1,
        "font-weight": 1,
        "line-height": 1,
        opacity: 1,
        "z-index": 1,
        zoom: 1
    };
    var fragmentRE = /^\s*<(\w+|!)[^>]*>/;
    var tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi;
    var rootNodeRE = /^(?:body|html)$/i;
    //需要在方法中频繁调用的属性
    var methodAttributes = [ "val", "css", "html", "text", "data", "width", "height", "offset" ];
    var adjacencyOperators = [ "after", "prepend", "before", "append" ];
    var table = document.createElement("table");
    var tableRow = document.createElement("tr");
    var containers = {
        tr: document.createElement("tbody"),
        tbody: table,
        thead: table,
        tfoot: table,
        td: tableRow,
        th: tableRow,
        "*": document.createElement("div")
    };
    var readyRE = /complete|loaded|interactive/;
    var classSelectorRE = /^\.([\w-]+)$/;
    var idSelectorRE = /^#([\w-]*)$/;
    var tagSelectorRE = /^[\w-]+$/;
    var class2type = {};
    var toString = class2type.toString;
    var camelize, uniq;
    var tempParent = document.createElement("div");
    var coreHasOwn = Object.prototype.hasOwnProperty;
    //命名空间
    var core = {};
    function type(obj) {
        return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
    }
    function isWindow(obj) {
        return obj != null && obj === obj.window;
    }
    function isDocument(obj) {
        return obj != null && obj.nodeType === obj.DOCUMENT_NODE;
    }
    function compact(array) {
        return filter.call(array, function(item) {
            return item != null;
        });
    }
    function isObject(obj) {
        return type(obj) === "object";
    }
    function isPlainObject(obj) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
            return false;
        }
        try {
            // Not own constructor property must be Object
            if (obj.constructor && !coreHasOwn.call(obj, "constructor") && !coreHasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }
        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        var key;
        for (key in obj) {}
        return key === undefined || coreHasOwn.call(obj, key);
    }
    function flatten(array) {
        return array.length > 0 ? $.fn.concat.apply([], array) : array;
    }
    camelize = function(str) {
        return str.replace(/-+(.)?/g, function(match, chr) {
            return chr ? chr.toUpperCase() : "";
        });
    };
    function likeArray(obj) {
        return typeof obj.length === "number";
    }
    function dasherize(str) {
        return str.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/_/g, "-").toLowerCase();
    }
    function classRE(name) {
        return name in classCache ? classCache[name] : classCache[name] = new RegExp("(^|\\s)" + name + "(\\s|$)");
    }
    function maybeAddPx(name, value) {
        return typeof value === "number" && !cssNumber[dasherize(name)] ? value + "px" : value;
    }
    function funcArg(context, arg, idx, payload) {
        return $.isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }
    function setAttribute(node, name, value) {
        if (value === null) {
            node.removeAttribute(name);
        } else {
            node.setAttribute(name, value);
        }
    }
    // access className property while respecting SVGAnimatedString
    function className(node, value) {
        var klass = node.className, svg = klass && klass.baseVal !== undefi;
        if (value === undefi) {
            return svg ? klass.baseVal : klass;
        }
        if (svg) {
            klass.baseVal = value;
        } else {
            node.className = value;
        }
    }
    uniq = function(array) {
        return filter.call(array, function(item, idx) {
            return array.indexOf(item) === idx;
        });
    };
    function defaultDisplay(nodeName) {
        var element, display;
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName);
            document.body.appendChild(element);
            display = getComputedStyle(element, "").getPropertyValue("display");
            element.parentNode.removeChild(element);
            if (display === "none") {
                display = "block";
            }
            elementDisplay[nodeName] = display;
        }
        return elementDisplay[nodeName];
    }
    function children(element) {
        return "children" in element ? slice.call(element.children) : $.map(element.childNodes, function(node) {
            if (node.nodeType === 1) {
                return node;
            }
        });
    }
    /**
     * [matches description]
     * @param  {[type]} element  [description]
     * @param  {[type]} selector [description]
     * @return {[type]}          [description]
     */
    core.matches = function(element, selector) {
        if (!element || element.nodeType !== 1) {
            return false;
        }
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector;
        if (matchesSelector) {
            return matchesSelector.call(element, selector);
        }
        var match;
        var parent = element.parentNode;
        var temp = !parent;
        if (temp) {
            (parent = tempParent).appendChild(element);
        }
        match = ~core.qsa(parent, selector).indexOf(element);
        if (temp) {
            tempParent.removeChild(element);
        }
        return match;
    };
    /**
     * `core.fragment` takes a html string and an optional tag name
     * to generate DOM nodes nodes from the given html string.
     * The generated DOM nodes are returned as an array.
     * This function can be overriden in plugins for example to make
     * it compatible with browsers that don't support the DOM fully.
     * @param  {[type]} html       [description]
     * @param  {[type]} name       [description]
     * @param  {[type]} properties [description]
     * @return {[type]}            [description]
     */
    core.fragment = function(html, name, properties) {
        if (html.replace) {
            html = html.replace(tagExpanderRE, "<$1></$2>");
        }
        if (name === undefi) {
            name = fragmentRE.test(html) && RegExp.$1;
        }
        if (!(name in containers)) {
            name = "*";
        }
        var nodes, dom, container = containers[name];
        container.innerHTML = "" + html;
        dom = $.each(slice.call(container.childNodes), function() {
            container.removeChild(this);
        });
        if (isPlainObject(properties)) {
            nodes = $(dom);
            $.each(properties, function(key, value) {
                if (methodAttributes.indexOf(key) > -1) {
                    nodes[key](value);
                } else {
                    nodes.attr(key, value);
                }
            });
        }
        return dom;
    };
    /**
     * `core.Z` swaps out the prototype of the given `dom` array
     *  of nodes with `$.fn` and thus supplying all the mobi
     *  functions to the array. Note that `__proto__` is not
     *  supported on Internet  Explorer.
     *  This method can be overriden in plugins.
     * @param {[type]} dom      [description]
     * @param {[type]} selector [description]
     */
    core.Z = function(dom, selector) {
        dom = dom || [];
        dom["__proto__"] = $.fn;
        dom.selector = selector || "";
        return dom;
    };
    /**
     * 判断是不是已经是集合了
     * @param  {[type]}  object [description]
     * @return {Boolean}        [description]
     */
    core.isZ = function(object) {
        return object instanceof core.Z;
    };
    /**
     * 初始化
     * @param  {[type]} selector [css选择器]
     * @param  {[type]} context  [上下文]
     * @return {[type]}          [description]
     */
    core.init = function(selector, context) {
        //如果未传参，返回一个空的集合
        if (!selector) {
            return core.Z();
        } else if ($.isFunction(selector)) {
            //如果是一个方法，在dom ready后运行
            return $(document).ready(selector);
        } else if (core.isZ(selector)) {
            //如果集合已经给了，直接返回
            return selector;
        } else {
            var dom;
            //如果给定的selector是一个数组，格式化
            if ($.isArray(selector)) {
                dom = compact(selector);
            } else if (isObject(selector)) {
                //包裹节点，如果是一个普通的对象，复制
                dom = [ isPlainObject(selector) ? $.extend({}, selector) : selector ];
                selector = null;
            } else if (fragmentRE.test(selector)) {
                //如果是html片段，创建节点
                dom = core.fragment(selector.trim(), RegExp.$1, context);
                selector = null;
            } else if (context !== undefi) {
                //如果有上下文，先创建一个上下文的集合，从这开始查找节点
                return $(context).find(selector);
            } else {
                //处理css选择器
                dom = core.qsa(document, selector);
            }
            return core.Z(dom, selector);
        }
    };
    /**
     * 调用core的init
     * @param  {[type]} selector [description]
     * @param  {[type]} context  [description]
     * @return {[type]}          [description]
     */
    $ = function(selector, context) {
        return core.init(selector, context);
    };
    lang.extend($, lang);
    /**
     * `core.qsa` is mobi's CSS selector implementation which
     * uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
     * This method can be overriden in plugins.
     * @param  {[type]} element  [description]
     * @param  {[type]} selector [description]
     * @return {[type]}          [description]
     */
    core.qsa = function(element, selector) {
        var found;
        return isDocument(element) && idSelectorRE.test(selector) ? (found = element.getElementById(RegExp.$1)) ? [ found ] : [] : element.nodeType !== 1 && element.nodeType !== 9 ? [] : slice.call(classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) : tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) : element.querySelectorAll(selector));
    };
    // 'true'  => true
    // 'false' => false
    // 'null'  => null
    // '42'    => 42
    // '42.5'  => 42.5
    // JSON    => parse if valid
    // String  => self
    function deserializeValue(value) {
        var num;
        try {
            return value ? value === "true" || (value === "false" ? false : value === "null" ? null : !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
        } catch (e) {
            return value;
        }
    }
    $.type = type;
    $.isWindow = isWindow;
    $.isPlainObject = isPlainObject;
    // plugin compatibility
    $.uuid = 0;
    $.support = {};
    $.expr = {};
    $.camelCase = camelize;
    $.map = function(elements, callback) {
        var value, values = [], i, key;
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i);
                if (value != null) {
                    values.push(value);
                }
            }
        } else {
            for (key in elements) {
                value = callback(elements[key], key);
                if (value != null) {
                    values.push(value);
                }
            }
        }
        return flatten(values);
    };
    function filtered(nodes, selector) {
        return selector === undefi ? $(nodes) : $(nodes).filter(selector);
    }
    $.contains = function(parent, node) {
        return parent !== node && parent.contains(node);
    };
    $.each = function(elements, callback) {
        lang.each(elements, function(val, key) {
            callback.call(val, key, val);
        });
        return elements;
    };
    if (window.JSON) {
        $.parseJSON = JSON.parse;
    }
    // Populate the class2type map
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });
    $.fn = {
        //集合操作类似于数组
        forEach: function(iterator, obj) {
            lang.each(this, iterator, obj);
            return this;
        },
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        indexOf: emptyArray.indexOf,
        concat: emptyArray.concat,
        ready: function(callback) {
            if (readyRE.test(document.readyState)) {
                callback($);
            } else {
                document.addEventListener("DOMContentLoaded", function() {
                    callback($);
                }, false);
            }
            return this;
        },
        slice: function() {
            return $(slice.apply(this, arguments));
        },
        get: function(idx) {
            return idx === undefi ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
        },
        toArray: function() {
            return this.get();
        },
        size: function() {
            return this.length;
        },
        filter: function(selector) {
            if ($.isFunction(selector)) {
                return this.not(this.not(selector));
            }
            return $(filter.call(this, function(element) {
                return core.matches(element, selector);
            }));
        },
        map: function(fn) {
            return $($.map(this, function(el, i) {
                return fn.call(el, i, el);
            }));
        },
        index: function(element) {
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
        },
        find: function(selector) {
            var result, $this = this;
            if (typeof selector === "object") {
                result = $(selector).filter(function() {
                    var node = this;
                    return emptyArray.some.call($this, function(parent) {
                        return $.contains(parent, node);
                    });
                });
            } else if (this.length === 1) {
                result = $(core.qsa(this[0], selector));
            } else {
                result = this.map(function() {
                    return core.qsa(this, selector);
                });
            }
            return result;
        },
        closest: function(selector, context) {
            var node = this[0], collection = false;
            if (typeof selector === "object") {
                collection = $(selector);
            }
            while (node && !(collection ? collection.indexOf(node) >= 0 : core.matches(node, selector))) {
                node = node !== context && !isDocument(node) && node.parentNode;
            }
            return $(node);
        },
        each: function(callback) {
            emptyArray.every.call(this, function(el, idx) {
                return callback.call(el, idx, el) !== false;
            });
            return this;
        },
        attr: function(name, value) {
            var result;
            return typeof name === "string" && value === undefi ? this.length === 0 || this[0].nodeType !== 1 ? undefi : name === "value" && this[0].nodeName === "INPUT" ? this.val() : !(result = this[0].getAttribute(name)) && name in this[0] ? this[0][name] : result : this.each(function(idx) {
                if (this.nodeType !== 1) {
                    return;
                }
                if (isObject(name)) {
                    for (var key in name) {
                        setAttribute(this, key, name[key]);
                    }
                } else {
                    setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
                }
            });
        },
        removeAttr: function(name) {
            return this.each(function() {
                if (this.nodeType === 1) {
                    setAttribute(this, name);
                }
            });
        },
        prop: function(name, value) {
            return value === undefi ? this[0] && this[0][name] : this.each(function(idx) {
                this[name] = funcArg(this, value, idx, this[name]);
            });
        },
        data: function(name, value) {
            var data = this.attr("data-" + dasherize(name), value);
            return data !== null ? deserializeValue(data) : undefi;
        },
        val: function(value) {
            return value === undefi ? this[0] && (this[0].multiple ? $(this[0]).find("option").filter(function(o) {
                return this.selected;
            }).pluck("value") : this[0].value) : this.each(function(idx) {
                this.value = funcArg(this, value, idx, this.value);
            });
        },
        offset: function(coordinates) {
            if (coordinates) {
                return this.each(function(index) {
                    var $this = $(this), coords = funcArg(this, coordinates, index, $this.offset()), parentOffset = $this.offsetParent().offset(), props = {
                        top: coords.top - parentOffset.top,
                        left: coords.left - parentOffset.left
                    };
                    if ($this.css("position") === "static") {
                        props["position"] = "relative";
                    }
                    $this.css(props);
                });
            }
            if (this.length === 0) {
                return null;
            }
            var obj = this[0].getBoundingClientRect();
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            };
        },
        css: function(property, value) {
            if (arguments.length < 2 && typeof property === "string") {
                return this[0] && (this[0].style[camelize(property)] || getComputedStyle(this[0], "").getPropertyValue(property));
            }
            var css = "";
            if (type(property) === "string") {
                if (!value && value !== 0) {
                    this.each(function() {
                        this.style.removeProperty(dasherize(property));
                    });
                } else {
                    css = dasherize(property) + ":" + maybeAddPx(property, value);
                }
            } else {
                for (var key in property) {
                    if (!property[key] && property[key] !== 0) {
                        this.each(function() {
                            this.style.removeProperty(dasherize(key));
                        });
                    } else {
                        css += dasherize(key) + ":" + maybeAddPx(key, property[key]) + ";";
                    }
                }
            }
            return this.each(function() {
                this.style.cssText += ";" + css;
            });
        },
        text: function(text) {
            return text === undefi ? this.length > 0 ? this[0].textContent : null : this.each(function() {
                this.textContent = text;
            });
        },
        hasClass: function(name) {
            return emptyArray.some.call(this, function(el) {
                return this.test(className(el));
            }, classRE(name));
        },
        addClass: function(name) {
            return this.each(function(idx) {
                classList = [];
                var cls = className(this), newName = funcArg(this, name, idx, cls);
                newName.split(/\s+/g).forEach(function(klass) {
                    if (!$(this).hasClass(klass)) {
                        classList.push(klass);
                    }
                }, this);
                if (classList.length) {
                    className(this, cls + (cls ? " " : " ") + classList.join(" "));
                }
            });
        },
        removeClass: function(name) {
            return this.each(function(idx) {
                if (name === undefi) {
                    return className(this, "");
                }
                classList = className(this);
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
                    classList = classList.replace(classRE(klass), " ");
                });
                className(this, classList.trim());
            });
        },
        toggleClass: function(name, when) {
            return this.each(function(idx) {
                var $this = $(this), names = funcArg(this, name, idx, className(this)), expr;
                names.split(/\s+/g).forEach(function(klass) {
                    if (when === undefi) {
                        expr = !$this.hasClass(klass);
                    } else {
                        expr = when;
                    }
                    if (expr) {
                        $this.addClass(klass);
                    } else {
                        $this.removeClass(klass);
                    }
                });
            });
        },
        scrollTop: function() {
            if (!this.length) {
                return;
            }
            return "scrollTop" in this[0] ? this[0].scrollTop : this[0].scrollY;
        },
        position: function() {
            if (!this.length) {
                return;
            }
            var elem = this[0], // Get *real* offsetParent
            offsetParent = this.offsetParent(), // Get correct offsets
            offset = this.offset(), parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {
                top: 0,
                left: 0
            } : offsetParent.offset();
            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top -= parseFloat($(elem).css("margin-top")) || 0;
            offset.left -= parseFloat($(elem).css("margin-left")) || 0;
            // Add offsetParent borders
            parentOffset.top += parseFloat($(offsetParent[0]).css("border-top-width")) || 0;
            parentOffset.left += parseFloat($(offsetParent[0]).css("border-left-width")) || 0;
            // Subtract the two offsets
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        },
        clone: function() {
            return this.map(function() {
                return this.cloneNode(true);
            });
        },
        hide: function() {
            return this.css("display", "none");
        },
        toggle: function(setting) {
            return this.each(function() {
                var el = $(this), expr;
                if (setting === undefi) {
                    expr = el.css("display") === "none";
                } else {
                    expr = setting;
                }
                if (expr) {
                    el.show();
                } else {
                    el.hide();
                }
            });
        },
        prev: function(selector) {
            return $(this.pluck("previousElementSibling")).filter(selector || "*");
        },
        next: function(selector) {
            return $(this.pluck("nextElementSibling")).filter(selector || "*");
        },
        remove: function() {
            return this.each(function() {
                if (this.parentNode != null) {
                    this.parentNode.removeChild(this);
                }
            });
        },
        html: function(html) {
            return html === undefi ? this.length > 0 ? this[0].innerHTML : null : this.each(function(idx) {
                var originHtml = this.innerHTML;
                $(this).empty().append(funcArg(this, html, idx, originHtml));
            });
        },
        empty: function() {
            return this.each(function() {
                this.innerHTML = "";
            });
        },
        replaceWith: function(newContent) {
            return this.before(newContent).remove();
        },
        wrap: function(structure) {
            var func = $.isFunction(structure);
            if (this[0] && !func) {
                var dom = $(structure).get(0), clone = dom.parentNode || this.length > 1;
            }
            return this.each(function(index) {
                $(this).wrapAll(func ? structure.call(this, index) : clone ? dom.cloneNode(true) : dom);
            });
        },
        wrapAll: function(structure) {
            if (this[0]) {
                $(this[0]).before(structure = $(structure));
                var children;
                // drill down to the inmost element
                while ((children = structure.children()).length) {
                    structure = children.first();
                }
                $(structure).append(this);
            }
            return this;
        },
        wrapInner: function(structure) {
            var func = $.isFunction(structure);
            return this.each(function(index) {
                var self = $(this), contents = self.contents(), dom = func ? structure.call(this, index) : structure;
                if (contents.length) {
                    contents.wrapAll(dom);
                } else {
                    self.append(dom);
                }
            });
        },
        unwrap: function() {
            this.parent().each(function() {
                $(this).replaceWith($(this).children());
            });
            return this;
        },
        is: function(selector) {
            return this.length > 0 && core.matches(this[0], selector);
        },
        not: function(selector) {
            var nodes = [];
            if ($.isFunction(selector) && selector.call !== undefi) {
                this.each(function(idx) {
                    if (!selector.call(this, idx)) {
                        nodes.push(this);
                    }
                });
            } else {
                var excludes = typeof selector === "string" ? this.filter(selector) : likeArray(selector) && $.isFunction(selector.item) ? slice.call(selector) : $(selector);
                this.forEach(function(el) {
                    if (excludes.indexOf(el) < 0) {
                        nodes.push(el);
                    }
                });
            }
            return $(nodes);
        },
        has: function(selector) {
            return this.filter(function() {
                return isObject(selector) ? $.contains(this, selector) : $(this).find(selector).size();
            });
        },
        eq: function(idx) {
            return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
        },
        first: function() {
            var el = this[0];
            return el && !isObject(el) ? el : $(el);
        },
        last: function() {
            var el = this[this.length - 1];
            return el && !isObject(el) ? el : $(el);
        },
        parents: function(selector) {
            var ancestors = [], nodes = this;
            while (nodes.length > 0) {
                nodes = $.map(nodes, function(node) {
                    if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node);
                        return node;
                    }
                });
            }
            return filtered(ancestors, selector);
        },
        parent: function(selector) {
            return filtered(uniq(this.pluck("parentNode")), selector);
        },
        children: function(selector) {
            return filtered(this.map(function() {
                return children(this);
            }), selector);
        },
        contents: function() {
            return this.map(function() {
                return slice.call(this.childNodes);
            });
        },
        siblings: function(selector) {
            return filtered(this.map(function(i, el) {
                return filter.call(children(el.parentNode), function(child) {
                    return child !== el;
                });
            }), selector);
        },
        pluck: function(property) {
            return $.map(this, function(el) {
                return el[property];
            });
        },
        show: function() {
            return this.each(function() {
                if (this.style.display === "none") {
                    this.style.display = null;
                }
                if (getComputedStyle(this, "").getPropertyValue("display") === "none") {
                    this.style.display = defaultDisplay(this.nodeName);
                }
            });
        },
        offsetParent: function() {
            return this.map(function() {
                var parent = this.offsetParent || document.body;
                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") === "static") {
                    parent = parent.offsetParent;
                }
                return parent;
            });
        }
    };
    // for now
    $.fn.detach = $.fn.remove;
    // Generate the `width` and `height` functions
    [ "width", "height" ].forEach(function(dimension) {
        $.fn[dimension] = function(value) {
            var offset, el = this[0], Dimension = dimension.replace(/./, function(m) {
                return m[0].toUpperCase();
            });
            if (value === undefi) {
                return isWindow(el) ? el["inner" + Dimension] : isDocument(el) ? el.documentElement["offset" + Dimension] : (offset = this.offset()) && offset[dimension];
            } else {
                return this.each(function(idx) {
                    el = $(this);
                    el.css(dimension, funcArg(this, value, idx, el[dimension]()));
                });
            }
        };
    });
    function traverseNode(node, fun) {
        fun(node);
        for (var key in node.childNodes) {
            traverseNode(node.childNodes[key], fun);
        }
    }
    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function(operator, operatorIndex) {
        var inside = operatorIndex % 2;
        //=> prepend, append
        $.fn[operator] = function() {
            // arguments can be nodes, arrays of nodes, mobi objects and HTML strings
            var argType, nodes = $.map(arguments, function(arg) {
                argType = type(arg);
                return argType === "object" || argType === "array" || arg === null ? arg : core.fragment(arg);
            }), parent, copyByClone = this.length > 1;
            if (nodes.length < 1) {
                return this;
            }
            return this.each(function(_, target) {
                parent = inside ? target : target.parentNode;
                // convert all methods to a 'before' operation
                target = operatorIndex === 0 ? target.nextSibling : operatorIndex === 1 ? target.firstChild : operatorIndex === 2 ? target : null;
                nodes.forEach(function(node) {
                    if (copyByClone) {
                        node = node.cloneNode(true);
                    } else if (!parent) {
                        return $(node).remove();
                    }
                    traverseNode(parent.insertBefore(node, target), function(el) {});
                });
            });
        };
        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        $.fn[inside ? operator + "To" : "insert" + (operatorIndex ? "Before" : "After")] = function(html) {
            $(html)[operator](this);
            return this;
        };
    });
    core.Z.prototype = $.fn;
    //this.mobi = $;
    // Export internal API functions in the `$.core` namespace
    core.uniq = uniq;
    core.deserializeValue = deserializeValue;
    $.core = core;
    return $;
});

define("mobi/lang", [], function(require, exports, module) {
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
        return typeof val === "function";
    };
    /**
     * 判断val是否是Array
     * @type {boolean}
     */
    ns.isArray = Array.isArray || function(val) {
        return toString.call(val) === "[object Array]";
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
        if (fn.bind === nativeBind && nativeBind) {
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
        return ns.delay.apply(null, [ fn, 1 ].concat(slice.call(arguments, 1)));
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
            args = arguments;
            // 参数被替换，因此多次时候，等待的总是用最后一次
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = fn.apply(context, args);
            } else if (!timeout) {
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
                if (!immediate) {
                    result = fn.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
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
            if (ran) {
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
            var args = [ fn ];
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
        if (obj === null) {
            return null;
        } else {
            var value = obj[key];
            if (ns.isFunction(value)) {
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
        if (obj) {
            if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === false) {
                        return obj;
                    }
                }
            } else {
                for (var key in obj) {
                    if (iterator.call(context, obj[key], key, obj) === false) {
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
        if (arr) {
            if (nativeIndexOf && arr.indexOf === nativeIndexOf) {
                return arr.indexOf(item, index);
            } else {
                var i = index || 0;
                for (var l = arr.length; i < l; i++) {
                    if (arr[i] === item) {
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
        if (arr) {
            if (nativeLastIndexOf && arr.lastIndexOf === nativeLastIndexOf) {
                return arr.lastIndexOf(item, typeof index === "number" ? index : -1);
            } else {
                var l = arr.length - 1;
                for (var i = Math.min(l, typeof index === "number" ? index : l); i >= 0; i--) {
                    if (arr[i] === item) {
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
            for (var key in source) {
                var v1 = source[key];
                var v2 = target[key];
                if (deep && (isObject(v1) || ns.isArray(v1))) {
                    if (isObject(v1) && !isObject(v2)) {
                        target[key] = {};
                    }
                    if (ns.isArray(v1) && !ns.isArray(v2)) {
                        target[key] = [];
                    }
                    extend(target[key], v1, deep);
                } else if (!ns.isUndefined(v1)) {
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
            if (typeof target === "boolean") {
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
            if (target === Object(target)) {
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
    ns.uniqueId = function(index) {
        return function(prefix) {
            var id = ++index + "";
            return prefix ? prefix + id : id;
        };
    }(0);
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
            escape: new RegExp("[" + arr.escape.join("") + "]", "g"),
            unescape: new RegExp("(" + arr.unescape.join("|") + ")", "g")
        };
        ns.each([ "escape", "unescape" ], function(method) {
            ns[method] = function(str) {
                return ("" + str).replace(reg[method], function(match) {
                    return entityMap[method][match];
                });
            };
        });
    })({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;"
    });
    /**
     * 消除字符串两边的空白
     * @param str
     * @returns {*}
     */
    ns.trim = function(str) {
        if (typeof str === "string") {
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
        } else {
            return str;
        }
    };
    /**
     * 将字符串解析为JSON对象
     */
    ns.parseJSON = function() {
        var rvalidchars = /^[\],:{}\s]*$/;
        var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
        var rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g;
        var rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
        return function(data) {
            if (window.JSON && window.JSON.parse) {
                return window.JSON.parse(data);
            }
            if (data === null) {
                return data;
            }
            if (typeof data === "string") {
                data = ns.trim(data);
                if (data) {
                    if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) {
                        return new Function("return " + data)();
                    }
                }
            }
            throw new Error("Invalid JSON: " + data);
        };
    }();
});

/**
 * 事件系统，由zepto事件系统改造而来
 * User: caolvchong@gmail.com
 * Date: 4/16/13
 * Time: 11:04 AM
 */
define("mobi/event", [ "./core", "./lang" ], function(require, exports, module) {
    var $ = require("./core");
    var lang = require("./lang");
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
    var hover = {
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    };
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
        var parts = ("" + event).split(".");
        return {
            e: parts[0],
            ns: parts.slice(1).sort().join(" ")
        };
    }
    /**
     * 生成命名空间的正则，例如：
     * 'click.hello.world' 命名空间是hello.world，对应的正则表达式为： /(?:^| )hello .* ?world(?: |$)/
     * @param ns 命名空间字符串
     * @returns {RegExp}
     */
    function matcherFor(ns) {
        return new RegExp("(?:^| )" + ns.replace(" ", " .* ?") + "(?: |$)");
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
        if (event.ns) {
            var matcher = matcherFor(event.ns);
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
        if (typeof events !== "string") {
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
        return handler.del && (handler.e === "focus" || handler.e === "blur") || !!captureSetting;
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
        var id = zid(element);
        // 得到zid
        var set = handlers[id] || (handlers[id] = []);
        // 如果存在缓存（该节点被处理过事件），则直接取出，否则新建一个数组作为缓存
        eachEvent(events, fn, function(event, fn) {
            var handler = parse(event);
            // 格式化为 {e: 事件类型, ns: 事件命名空间}
            handler.fn = fn;
            // 事件处理函数
            handler.sel = selector;
            if (handler.e in hover) {
                // 事件类型是mouseenter或者mouseleave
                // relatedTarget为事件相关对象，只有在mouseover和mouseout事件时才有值
                // mouseover时表示的是鼠标移出的那个对象，mouseout时表示的是鼠标移入的那个对象
                // 当related不存在，表示事件不是mouseover
                // mouseout,mouseover时!$.contains(this, related)当相关对象不在事件对象内且related !== this相关对象不是事件对象时
                // 表示鼠标已经从事件对象外部移入到了对象本身，这个时间是要执行处理函数的
                // 当鼠标从事件对象上移入到子节点的时候related就等于this了，且!$.contains(this, related)也不成立，这个时间是不需要执行处理函数的
                fn = function(e) {
                    var related = e.relatedTarget;
                    if (!related || related !== this && !$.contains(this, related)) {
                        // 离开了节点，则直接执行
                        return handler.fn.apply(this, arguments);
                    }
                };
            }
            handler.del = getDelegate && getDelegate(fn, event);
            // 委托
            var callback = handler.del || fn;
            // 有提供委托用委托，没有用事件回调处理
            handler.proxy = function(e) {
                var result = callback.apply(element, [ e ].concat(e.data));
                if (result === false) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return result;
            };
            handler.i = set.length;
            // 当前处理的事件在缓存中的位置
            set.push(handler);
            // 将当前事件处理推入缓存
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
        eachEvent(events || "", fn, function(event, fn) {
            lang.each(findHandlers(element, event, fn, selector), function(handler) {
                delete handlers[id][handler.i];
                element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
            });
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
            preventDefault: "isDefaultPrevented",
            stopImmediatePropagation: "isImmediatePropagationStopped",
            stopPropagation: "isPropagationStopped"
        };
        /**
         * 格式化事件对象
         */
        var createProxy = function(event) {
            var key;
            var proxy = {
                originalEvent: event
            };
            for (key in event) {
                // 复制属性
                if (!ignoreProperties.test(key) && event[key] !== undefined) {
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
            if (!("defaultPrevented" in event)) {
                event.defaultPrevented = false;
                var prevent = event.preventDefault;
                event.preventDefault = function() {
                    this.defaultPrevented = true;
                    prevent.call(this);
                };
            }
        };
        var specialEvents = {};
        specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = "MouseEvents";
        /**
         * 定义事件
         * @param type
         * @param props
         * @returns {Event}
         */
        var Event = function(type, props) {
            if (typeof type !== "string") {
                props = type;
                type = props.type;
            }
            var event = document.createEvent(specialEvents[type] || "Events");
            var bubbles = true;
            if (props) {
                for (var name in props) {
                    if (name === "bubbles") {
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
                            remove(element, type, fn);
                            // 解绑
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
                            var match = $(e.target).closest(selector, element).get(0);
                            // 指定的事件源节点
                            if (match) {
                                evt = $.extend(createProxy(e), {
                                    currentTarget: match,
                                    liveFired: element
                                });
                                return fn.apply(match, [ evt ].concat([].slice.call(arguments, 1)));
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
                if (typeof event === "string" || $.isPlainObject(event)) {
                    event = Event(event);
                }
                fix(event);
                event.data = data;
                return this.each(function() {
                    if ("dispatchEvent" in this) {
                        this.dispatchEvent(event);
                    }
                });
            }
        });
        /**
         * 常规DOM事件的快速写法支持
         */
        lang.each(("focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select keydown keypress keyup error").split(" "), function(event) {
            $.fn[event] = function(callback) {
                return callback ? this.bind(event, callback) : this.trigger(event);
            };
        });
        lang.each([ "focus", "blur" ], function(name) {
            $.fn[name] = function(callback) {
                if (callback) {
                    this.bind(name, callback);
                } else {
                    this.each(function() {
                        try {
                            this[name]();
                        } catch (e) {}
                    });
                }
                return this;
            };
        });
    })();
    module.exports = $;
});

/**
 * AJAX基础功能
 * User: caolvchong@gmail.com
 * Date: 4/23/13
 * Time: 11:06 AM
 */
define("mobi/ajax", [ "./core", "./lang", "./event" ], function(require, exports, module) {
    var $ = require("./core");
    var event = require("./event");
    var undef;
    var jsonpID = 0;
    // jsonp的标识
    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    var scriptTypeRE = /^(?:text|application)\/javascript/i;
    var xmlTypeRE = /^(?:text|application)\/xml/i;
    var jsonType = "application/json";
    var htmlType = "text/html";
    var blankRE = /^\s*$/;
    var empty = function() {};
    // 默认AJAX设置
    var ajaxSettings = {
        // 请求类型
        type: "GET",
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
            script: "text/javascript, application/javascript",
            json: jsonType,
            xml: "application/xml, text/xml",
            html: htmlType,
            text: "text/plain"
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
        if (settings.global) {
            return triggerAndReturn(context || document, eventName, data);
        }
    };
    var activeCount = 0;
    // 当前活跃的AJAX请求数
    var trigger = {
        /**
         * 发送请求前的回调和事件，返回false则取消AJAX/JSONP请求，否则触发ajaxSend事件
         * @param xhr
         * @param settings
         * @returns {boolean}
         */
        before: function(xhr, settings) {
            var context = settings.context;
            if (settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, "ajaxBeforeSend", [ xhr, settings ]) === false) {
                activeCount--;
                return false;
            }
            triggerGlobal(settings, context, "ajaxSend", [ xhr, settings ]);
        },
        /**
         * AJAX发送请求开始的回调
         * @param settings
         */
        start: function(settings) {
            if (settings.global && activeCount++ === 0) {
                triggerGlobal(settings, null, "ajaxStart");
            }
        },
        success: function(data, xhr, settings) {
            var context = settings.context;
            var status = "success";
            settings.success.call(context, data, status, xhr);
            triggerGlobal(settings, context, "ajaxSuccess", [ xhr, settings, data ]);
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
            triggerGlobal(settings, context, "ajaxError", [ xhr, settings, error ]);
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
            triggerGlobal(settings, context, "ajaxComplete", [ xhr, settings ]);
            trigger.stop(settings);
        },
        /**
         * 停止请求
         * @param settings
         */
        stop: function(settings) {
            if (settings.global && !--activeCount) {
                triggerGlobal(settings, null, "ajaxStop");
            }
        }
    };
    /**
     * 根据mime得到格式 html/json/script/xml/text
     * @param mime
     */
    var mimeToDataType = function(mime) {
        if (mime) {
            mime = mime.split(";", 2)[0];
        }
        return mime && (mime === htmlType ? "html" : mime === jsonType ? "json" : scriptTypeRE.test(mime) ? "script" : xmlTypeRE.test(mime) && "xml") || "text";
    };
    /**
     * 在url后面拼接查询参数
     * @param url
     * @param query
     */
    var appendQuery = function(url, query) {
        url += url.indexOf("?") === -1 ? "?" : "&";
        return url + query;
    };
    /**
     * 序列化参数
     * @param options
     */
    var serializeData = function(options) {
        // options.data不是字符串时候，将其序列化为字符串
        if (options.processData && options.data && typeof options.data !== "string") {
            options.data = $.param(options.data, options.traditional);
        }
        // get请求将data拼接到URL中
        if (options.data && (!options.type || options.type.toUpperCase() === "GET")) {
            options.url = appendQuery(options.url, options.data);
        }
    };
    var serialize = function(params, obj, traditional, scope) {
        var isArray = $.isArray(obj);
        $.each(obj, function(key, value) {
            if (scope) {
                key = traditional ? scope : scope + "[" + (isArray ? "" : key) + "]";
            }
            if (!scope && isArray) {
                params.add(value.name, value.value);
            } else if (isArray || !traditional && typeof value === "object") {
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
        var hasData = !$.isFunction(data);
        // data非函数
        return {
            url: url,
            data: hasData ? data : undef,
            // data为function时候表示没有传递参数
            success: !hasData ? data : $.isFunction(success) ? success : undef,
            // data是函数则为成功回调，不是函数则看success
            dataType: hasData ? dataType || success : success
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
                this.push(escape(k) + "=" + escape(v));
            };
            serialize(params, obj, traditional);
            return params.join("&").replace(/%20/g, "+");
        },
        /**
         * JSONP
         * @param options
         */
        ajaxJSONP: function(options) {
            if (!("type" in options)) {
                return $.ajax(options);
            }
            var callbackName = "jsonp" + ++jsonpID;
            var script = document.createElement("script");
            var cleanup = function() {
                clearTimeout(abortTimeout);
                $(script).remove();
                delete window[callbackName];
            };
            var abort = function(type) {
                cleanup();
                // 主动放弃请求或者超时回调都会执行从而造成报错，因此重写为空函数
                if (!type || type === "timeout") {
                    window[callbackName] = empty;
                }
                trigger.error(null, type || "abort", xhr, options);
            };
            var xhr = {
                abort: abort
            };
            var abortTimeout;
            if (trigger.before(xhr, options) === false) {
                abort("abort");
                return false;
            }
            window[callbackName] = function(data) {
                cleanup();
                trigger.success(data, xhr, options);
            };
            script.onerror = function() {
                abort("error");
            };
            script.src = options.url.replace(/=\?/, "=" + callbackName);
            $("head").append(script);
            if (options.timeout > 0) {
                abortTimeout = setTimeout(function() {
                    abort("timeout");
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
            for (var key in ajaxSettings) {
                if ($.isUndefined(settings[key])) {
                    settings[key] = ajaxSettings[key];
                }
            }
            // 触发ajaxStart事件
            trigger.start(settings);
            if (!settings.crossDomain) {
                settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) && RegExp.$2 !== window.location.host;
            }
            if (!settings.url) {
                settings.url = window.location.toString();
            }
            // 请求参数序列化
            serializeData(settings);
            if (settings.cache === false) {
                settings.url = appendQuery(settings.url, "_=" + Date.now());
            }
            var dataType = settings.dataType;
            var hasPlaceholder = /=\?/.test(settings.url);
            if (dataType === "jsonp" || hasPlaceholder) {
                if (!hasPlaceholder) {
                    settings.url = appendQuery(settings.url, "callback=?");
                }
                return $.ajaxJSONP(settings);
            }
            var mime = settings.accepts[dataType];
            var baseHeaders = {};
            var protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol;
            var xhr = settings.xhr();
            var abortTimeout;
            // 头处理
            if (!settings.crossDomain) {
                baseHeaders["X-Requested-With"] = "XMLHttpRequest";
            }
            if (mime) {
                baseHeaders.Accept = mime;
                if (mime.indexOf(",") > -1) {
                    mime = mime.split(",", 2)[0];
                }
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType(mime);
                }
            }
            if (settings.contentType || settings.contentType !== false && settings.data && settings.type.toUpperCase() !== "GET") {
                baseHeaders["Content-Type"] = settings.contentType || "application/x-www-form-urlencoded";
            }
            settings.headers = $.extend(baseHeaders, settings.headers || {});
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    xhr.onreadystatechange = empty;
                    clearTimeout(abortTimeout);
                    var result;
                    var error = false;
                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 0 && protocol === "file:") {
                        dataType = dataType || mimeToDataType(xhr.getResponseHeader("content-type"));
                        result = xhr.responseText;
                        try {
                            // http://perfectionkills.com/global-eval-what-are-the-options/
                            if (dataType === "script") {
                                var g = (1, eval);
                                g(result);
                            } else if (dataType === "xml") {
                                result = xhr.responseXML;
                            } else if (dataType === "json") {
                                result = blankRE.test(result) ? null : $.parseJSON(result);
                            }
                        } catch (e) {
                            error = e;
                        }
                        if (error) {
                            trigger.error(error, "parsererror", xhr, settings);
                        } else {
                            trigger.success(result, xhr, settings);
                        }
                    } else {
                        trigger.error(null, xhr.status ? "error" : "abort", xhr, settings);
                    }
                }
            };
            var async = "async" in settings ? settings.async : true;
            xhr.open(settings.type, settings.url, async);
            for (var name in settings.headers) {
                xhr.setRequestHeader(name, settings.headers[name]);
            }
            if (trigger.before(xhr, settings) === false) {
                xhr.abort();
                return false;
            }
            if (settings.timeout > 0) {
                abortTimeout = setTimeout(function() {
                    xhr.onreadystatechange = empty;
                    xhr.abort();
                    trigger.error(null, "timeout", xhr, settings);
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
            options.type = "POST";
            return $.ajax(options);
        },
        /**
         * ajax请求，返回数据格式为JSON
         */
        getJSON: function(url, data, success) {
            var options = parseArguments.apply(null, arguments);
            options.dataType = "json";
            return $.ajax(options);
        }
    };
    $.extend($, r);
    /**
     * 某个节点直接载入AJAX返回的结果
     */
    $.fn.load = function(url, data, success) {
        if (!this.length) {
            // 没有节点
            return this;
        }
        var self = this;
        var parts = url.split(/\s/);
        var selector;
        var options = parseArguments(url, data, success);
        var callback = options.success;
        if (parts.length > 1) {
            options.url = parts[0];
            selector = parts[1];
        }
        options.success = function(response) {
            self.html(selector ? $("<div>").html(response.replace(rscript, "")).find(selector) : response);
            if (callback) {
                callback.apply(self, arguments);
            }
        };
        $.ajax(options);
        return this;
    };
    module.exports = $;
});

/**
 * 提供AJAX扩展，包括：
 *     配合后端JSON格式化处理，包含无权限，异常等操作
 *     AJAX单例模式，
 */
define("mobi/ajax_ext", [ "./ajax", "./core", "./lang", "./event" ], function(require, exports, module) {
    var $ = require("./ajax");
    var single = {};
    // 挂载ajax单例命名空间
    var config = {
        loginPage: "/",
        noPermissionAction: function() {
            location.href = config.loginPage;
        },
        errorAction: function(xhr, status) {}
    };
    var defaultRule = {
        success: function(data) {
            return data && +data.code === 200;
        },
        permission: function(data) {
            return data && +data.code === 401;
        }
    };
    var rule = function(data, p, type) {
        var fn;
        if (p && p.rule && $.isFunction(p.rule[type])) {
            fn = p.rule[type];
        } else {
            fn = defaultRule[type];
        }
        return fn(data) === true;
    };
    var r = {
        setNoPermissionAction: function(callback) {
            config.noPermissionAction = callback;
            r.setNoPermissionAction = null;
        },
        setErrorAction: function(callback) {
            config.errorAction = callback;
            r.setErrorAction = null;
        },
        /**
         * 基类ajax，要求服务端返回的结果格式必须是JSON，建议按code,data格式返回，如：
         * {
         *     code: 状态码，一般就以下三个：200成功/400失败/401无权限
         *     data: 返回的数据源
         * }
         * @param {Object} params
         *     在ajax的参数基础上增加了
         *         rule.success: 判定服务端成功的条件，默认data.code === 200
         *         rule.permission: 判定服务端无权限的条件，默认data.code === 401
         *         permission: 无权限时候的回调函数
         * @return {Object} XMLHttpRequrest对象
         */
        base: function(params) {
            var obj = $.extend({}, params || {});
            obj.dataType = "json";
            obj.type = params.type || "GET";
            obj.success = function(data) {
                if (rule(data, obj, "success")) {
                    // 成功
                    if (params.success) {
                        params.success(data);
                    }
                } else if (rule(data, obj, "permission")) {
                    // 无权限
                    if ($.isFunction(params.permission)) {
                        params.permission(data);
                    } else {
                        config.noPermissionAction();
                    }
                } else {
                    // 服务端判定失败
                    if ($.isFunction(params.error)) {
                        params.error(data);
                    } else {
                        config.errorAction(data);
                    }
                }
            };
            obj.error = function(xhr, status) {
                if (status !== "abort") {
                    // 主动放弃，这种一般是程序控制，不应该抛出error
                    if ($.isFunction(params.error)) {
                        params.error(xhr, status);
                    } else {
                        config.errorAction(xhr, status);
                    }
                }
            };
            obj.complete = function(xhr, status) {
                if ($.isFunction(params.complete)) {
                    params.complete(xhr, status);
                }
            };
            return $.ajax(obj);
        },
        /**
         * AJAX单例模式：
         *     如果请求资源和上一次相同，则放弃后来的请求
         *     如果请求资源和上一次不同，则中断之前的请求，使用后面的请求
         * @param {String} name 单例命名空间
         * @return {Object} 返回对创建的单例的操作方法：发起请求，放弃请求
         */
        single: function(name) {
            if (!single[name]) {
                single[name] = {};
            }
            var actions = {
                /**
                 * 发起一个AJAX单例请求
                 * @param params 同base方法的参数
                 * @return {undefined}
                 */
                send: function(params) {
                    var flag = single[name].url && params.url === single[name].url;
                    if (flag) {
                        // 请求URL相同
                        for (var i in params.data) {
                            if (params.data[i] !== single[name].data[i]) {
                                // 请求的数据也相同，则认为是发起同一个请求
                                flag = false;
                                break;
                            }
                        }
                    }
                    if (flag) {
                        // 请求的URL和参数相同则保留上一个
                        return false;
                    } else {
                        // 不相同则放弃前一个请求
                        if (single[name].xhr) {
                            single[name].xhr.abort();
                        }
                    }
                    var completeFn = params.complete;
                    params.complete = function(xhr, status) {
                        single[name] = {};
                        // 完成后清理
                        if ($.isFunction(completeFn)) {
                            completeFn(xhr, status);
                        }
                    };
                    single[name] = {
                        xhr: r.base(params),
                        url: params.url,
                        data: params.data
                    };
                },
                /**
                 * 放弃单例AJAX请求
                 */
                abort: function() {
                    if (single[name] && single[name].xhr) {
                        single[name].xhr.abort();
                        single[name].xhr = null;
                    }
                }
            };
            return actions;
        }
    };
    return r;
});

/**
 * User: caolvchong@gmail.com
 * Date: 5/3/13
 * Time: 11:56 AM
 */
define("mobi/detect", [ "./core", "./lang" ], function(require, exports, module) {
    var $ = require("./core");
    var detect = function(ua) {
        var os = this.os = {};
        var browser = this.browser = {};
        var webkit = ua.match(/WebKit\/([\d.]+)/);
        var android = ua.match(/(Android)\s+([\d.]+)/);
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
        var webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/);
        var touchpad = webos && ua.match(/TouchPad/);
        var kindle = ua.match(/Kindle\/([\d.]+)/);
        var silk = ua.match(/Silk\/([\d._]+)/);
        var blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/);
        var bb10 = ua.match(/(BB10).*Version\/([\d.]+)/);
        var rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/);
        var playbook = ua.match(/PlayBook/);
        var chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/);
        var firefox = ua.match(/Firefox\/([\d.]+)/);
        if (browser.webkit = !!webkit) {
            browser.version = webkit[1];
        }
        if (android) {
            os.android = true;
            os.version = android[2];
        }
        if (iphone) {
            os.ios = os.iphone = true;
            os.version = iphone[2].replace(/_/g, ".");
        }
        if (ipad) {
            os.ios = os.ipad = true;
            os.version = ipad[2].replace(/_/g, ".");
        }
        if (webos) {
            os.webos = true;
            os.version = webos[2];
        }
        if (touchpad) {
            os.touchpad = true;
        }
        if (blackberry) {
            os.blackberry = true;
            os.version = blackberry[2];
        }
        if (bb10) {
            os.bb10 = true;
            os.version = bb10[2];
        }
        if (rimtabletos) {
            os.rimtabletos = true;
            os.version = rimtabletos[2];
        }
        if (kindle) {
            os.kindle = true;
            os.version = kindle[1];
        }
        if (playbook) {
            browser.playbook = true;
        } else if (silk) {
            browser.silk = true;
            browser.version = silk[1];
        } else if (!silk && os.android && ua.match(/Kindle Fire/)) {
            browser.silk = true;
        }
        if (chrome) {
            browser.chrome = true;
            browser.version = chrome[1];
        } else if (firefox) {
            browser.firefox = true;
            browser.version = firefox[1];
        }
        os.tablet = !!(ipad || playbook || android && !ua.match(/Mobile/) || firefox && ua.match(/Tablet/));
        os.phone = !!(!os.tablet && (android || iphone || webos || blackberry || bb10 || chrome && ua.match(/Android/) || chrome && ua.match(/CriOS\/([\d.]+)/) || firefox && ua.match(/Mobile/)));
        return this;
    };
    detect.call($, navigator.userAgent);
    // 给$绑上 os和browser两个属性
    $.detect = detect;
    return function(ua) {
        return detect.call($, ua);
    };
});

define("mobi/history", [ "./core", "./lang" ], function(require, exports, module) {
    var $ = require("./core");
    var optionalParam = /\((.*?)\)/g;
    var namedParam = /(\(\?)?:\w+/g;
    // :通配符
    var splatParam = /\*\w+/g;
    // *号通配符
    var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    // 转义字符
    var defaultRouter = "defaultRouter";
    // 默认key
    var defaultHash;
    // 默认触发的hash，可以是一个字符串，或者是一个function
    var helper = {
        /**
         * 将路由转化为正则表达式
         * @param route
         */
        routeToReg: function(route) {
            route = route.replace(escapeRegExp, "\\$&").replace(optionalParam, "(?:$1)?").replace(namedParam, function(match, optional) {
                return optional ? match : "([^/]+)";
            }).replace(splatParam, "(.*?)");
            return new RegExp("^" + route + "$");
        },
        /**
         * 获取当前的hash
         * @returns {string}
         */
        getHash: function() {
            return location.hash.replace(/^#/, "");
        },
        search: function(hash, cache) {
            var match;
            for (var key in cache) {
                var item = cache[key];
                match = hash.match(item.reg);
                if (match) {
                    return {
                        action: item.action,
                        params: $.isArray(match) ? match.slice(1) : []
                    };
                }
            }
        },
        /**
         * 获取路由对应的处理函数
         * @param hash
         * @param cache
         */
        fetch: function(hash, cache) {
            var result = {
                action: null,
                params: []
            };
            hash = $.trim(hash);
            if (hash && hash !== defaultRouter) {
                result = helper.search(hash, cache);
            } else {
                if (defaultHash) {
                    if (typeof defaultHash === "string") {
                        result = helper.search(hash, cache);
                    } else if (typeof defaultHash === "function") {
                        result.action = defaultHash;
                    }
                }
            }
            return result;
        },
        /**
         * 找到对应hash的处理函数，并执行
         * @param hash
         * @param cache
         */
        match: function(hash, cache) {
            var fetch = helper.fetch(hash, cache);
            if (fetch.action) {
                fetch.action.apply(null, fetch.params);
                if (fetch.action.callback) {
                    fetch.action.callback();
                    delete fetch.action.callback;
                }
            }
        }
    };
    var iframe;
    var supportHash = "onhashchange" in window && ($.isUndefined(document.documentMode) || document.documentMode === 8);
    var lastHash = helper.getHash();
    var cache = {};
    var r = {
        /**
         * 获取当前的hash
         */
        get: helper.getHash,
        /**
         * 将当前的hash清空
         */
        empty: function() {
            location.hash = "";
        },
        /**
         * 触发某个路由，执行回调函数
         * @param hash
         * @param callback 执行完路由后的回调函数
         */
        trigger: function(hash, callback) {
            location.hash = hash;
            if ($.isFunction(callback)) {
                var fetch = helper.fetch(hash, cache);
                if (fetch.action) {
                    fetch.action.callback = callback;
                }
            }
        },
        /**
         * 设定路由监听
         * @param obj 键值对，key是路由表，值是路由对应的动作函数。路由表支持：
         *          :通配符，例如： user/:id 可以匹配 user/2   user/33
         *          *通配符，例如： *post 可以匹配 userpost    delpost
         */
        listen: function(obj) {
            (function() {
                for (var key in obj) {
                    if (key !== defaultRouter) {
                        if (!cache[key]) {
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
            if (supportHash) {
                window.onhashchange = function(e) {
                    var prev = e.oldURL;
                    var url = e.newURL;
                    var hash = helper.getHash();
                    if (prev !== url) {
                        helper.match(hash, cache);
                    }
                };
            } else {
                if (!iframe) {
                    $(function() {
                        var el = $('<iframe tabindex="-1" style="display:none" widht="0" height="0"/>').appendTo(document.body);
                        iframe = el[0].contentWindow;
                        el.bind("load", function() {
                            var hash = helper.getHash();
                            el.unbind("load");
                            var doc = iframe.document;
                            doc.open();
                            doc.write("<!DOCTYPE html><html><body>" + hash + "</body></html>");
                            doc.close();
                            setInterval(function() {
                                var hash = helper.getHash();
                                // 主窗口中的hash
                                var historyHash = iframe.document.body.innerText;
                                // 上一次hash
                                if (hash !== lastHash) {
                                    // 主窗口hash改变
                                    lastHash = hash;
                                    if (hash !== historyHash) {
                                        doc.open();
                                        doc.write("<!DOCTYPE html><html><body>" + hash + "</body></html>");
                                        doc.close();
                                    }
                                    helper.match(hash, cache);
                                } else if (historyHash !== lastHash) {
                                    // 回退/前进
                                    location.hash = historyHash;
                                }
                            }, 50);
                        });
                    });
                }
            }
            var initHash = helper.getHash();
            // 进入页面时候的hash
            if (initHash) {
                helper.match(initHash, cache);
            } else {
                if (defaultHash) {
                    helper.match(defaultHash, cache);
                }
            }
        }
    };
    return r;
});
