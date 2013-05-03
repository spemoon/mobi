define(function(require, exports, module) {

    var lang = require('./lang');

    var undefi, key, $, classList;
    var emptyArray = [];
    var slice = emptyArray.slice;
    var filter = emptyArray.slice;
    var document = window.document;
    var elementDisplay = {};
    var classCache = {};
    var getComputedStyle = document.defaultView.getComputedStyle;
    var cssNumber = {
        'column-count': 1,
        'columns': 1,
        'font-weight': 1,
        'line-height': 1,
        'opacity': 1,
        'z-index': 1,
        'zoom': 1
    };
    var fragmentRE = /^\s*<(\w+|!)[^>]*>/;
    var tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
    var rootNodeRE = /^(?:body|html)$/i;

    //需要在方法中频繁调用的属性
    var methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'];

    var adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ];
    var table = document.createElement('table');
    var tableRow = document.createElement('tr');
    var containers = {
        'tr': document.createElement('tbody'),
        'tbody': table,
        'thead': table,
        'tfoot': table,
        'td': tableRow,
        'th': tableRow,
        '*': document.createElement('div')
    };
    var readyRE = /complete|loaded|interactive/;
    var classSelectorRE = /^\.([\w-]+)$/;
    var idSelectorRE = /^#([\w-]*)$/;
    var tagSelectorRE = /^[\w-]+$/;
    var class2type = {};
    var toString = class2type.toString;
    var camelize, uniq;
    var tempParent = document.createElement('div');
    var coreHasOwn = Object.prototype.hasOwnProperty;

    //命名空间
    var core = {};

    function type(obj) {
        return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
    }

    function isWindow(obj) { return obj != null && obj === obj.window; }

    function isDocument(obj) { return obj != null && obj.nodeType === obj.DOCUMENT_NODE;}

    function compact(array) { return filter.call(array, function(item) { return item != null }); }

    function isObject(obj) { return type(obj) === 'object'; }

    function isPlainObject(obj) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if ( !obj || type(obj) !== 'object' || obj.nodeType || isWindow( obj ) ) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if ( obj.constructor &&
                !coreHasOwn.call(obj, 'constructor') &&
                !coreHasOwn.call(obj.constructor.prototype, 'isPrototypeOf') ) {
                return false;
            }
        } catch ( e ) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for ( key in obj ) {}

        return key === undefined || coreHasOwn.call( obj, key );
    }

    function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array; }

    camelize = function(str) { return str.replace(/-+(.)?/g, function(match, chr) { return chr ? chr.toUpperCase() : ''; }); }
    function likeArray(obj) { return typeof obj.length === 'number'; }

    function dasherize(str) {
        return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
    }

    function classRE(name) {
        return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }

    function maybeAddPx(name, value) {
        return (typeof value === 'number' && !cssNumber[dasherize(name)]) ? value + 'px' : value;
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

        if(value === undefi) {
            return svg ? klass.baseVal : klass;
        }
        if (svg) {
            klass.baseVal = value;
        } else {
            node.className = value;
        }
    }

    uniq = function(array) { return filter.call(array, function(item, idx) { return array.indexOf(item) === idx; }) };
    function defaultDisplay(nodeName) {
        var element, display;
        if(!elementDisplay[nodeName]) {
            element = document.createElement(nodeName);
            document.body.appendChild(element);
            display = getComputedStyle(element, '').getPropertyValue('display');
            element.parentNode.removeChild(element);
            if (display === 'none') {
                display = 'block';
            }
            elementDisplay[nodeName] = display;
        }
        return elementDisplay[nodeName];
    }

    function children(element) {
        return 'children' in element ? slice.call(element.children) : $.map(element.childNodes, function(node) { if(node.nodeType === 1) {return node;} });
    }

    /**
     * [matches description]
     * @param  {[type]} element  [description]
     * @param  {[type]} selector [description]
     * @return {[type]}          [description]
     */
    core.matches = function(element, selector) {
        if(!element || element.nodeType !== 1) {
            return false;
        }
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector;
        if(matchesSelector) {
            return matchesSelector.call(element, selector);
        }
        var match;
        var parent = element.parentNode;
        var temp = !parent;
        if(temp) {
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
        if(html.replace) {
            html = html.replace(tagExpanderRE, '<$1></$2>');
        }
        if(name === undefi) {
            name = fragmentRE.test(html) && RegExp.$1;
        }
        if(!(name in containers)) {
            name = '*';
        }

        var nodes, dom, container = containers[name];
        container.innerHTML = '' + html;
        dom = $.each(slice.call(container.childNodes), function() {
            container.removeChild(this);
        });
        if(isPlainObject(properties)) {
            nodes = $(dom);
            $.each(properties, function(key, value) {
                if(methodAttributes.indexOf(key) > -1) {
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
        dom['__proto__'] = $.fn;
        dom.selector = selector || '';
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
        if(!selector) {
            return core.Z();
        } else if($.isFunction(selector)) {
            //如果是一个方法，在dom ready后运行
            return $(document).ready(selector);
        } else if(core.isZ(selector)) {
            //如果集合已经给了，直接返回
            return selector;
        } else {
            var dom;
            //如果给定的selector是一个数组，格式化
            if($.isArray(selector)) {
                dom = compact(selector);
            } else if(isObject(selector)) {
                //包裹节点，如果是一个普通的对象，复制
                dom = [isPlainObject(selector) ? $.extend({}, selector) : selector];
                selector = null;
            } else if(fragmentRE.test(selector)) {
                //如果是html片段，创建节点
                dom = core.fragment(selector.trim(), RegExp.$1, context);
                selector = null;
            } else if(context !== undefi) {
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
        return (isDocument(element) && idSelectorRE.test(selector)) ? ( (found = element.getElementById(RegExp.$1)) ? [found] : [] ) : (element.nodeType !== 1 && element.nodeType !== 9) ? [] : slice.call(classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) : tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) : element.querySelectorAll(selector));
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
            return value ? value === 'true' || ( value === 'false' ? false : value === 'null' ? null : !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value ) : value;
        } catch(e) {
            return value;
        }
    }

    $.type = type;
    $.isWindow = isWindow;
    $.isPlainObject = isPlainObject;

    // plugin compatibility
    $.uuid = 0;
    $.support = { };
    $.expr = { };

    $.camelCase = camelize;

    $.map = function(elements, callback) {
        var value, values = [], i, key;
        if(likeArray(elements)) {
            for(i = 0; i < elements.length; i++) {
                value = callback(elements[i], i);
                if(value != null) {
                    values.push(value);
                }
            }
        } else {
            for(key in elements) {
                value = callback(elements[key], key);
                if(value != null) {
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

    if(window.JSON) {
        $.parseJSON = JSON.parse;
    }

    // Populate the class2type map
    $.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function(i, name) {
        class2type[ '[object ' + name + ']' ] = name.toLowerCase();
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
            if(readyRE.test(document.readyState)) {
                callback($);
            } else {
                document.addEventListener('DOMContentLoaded', function() {
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
        toArray: function() { return this.get(); },
        size: function() {
            return this.length;
        },
        filter: function(selector) {
            if($.isFunction(selector)) {
                return this.not(this.not(selector));
            }
            return $(filter.call(this, function(element) {
                return core.matches(element, selector);
            }));
        },
        map: function(fn) {
            return $($.map(this, function(el, i) { return fn.call(el, i, el); }));
        },
        index: function(element) {
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
        },
        find: function(selector) {
            var result, $this = this;
            if(typeof selector === 'object') {
                result = $(selector).filter(function() {
                    var node = this;
                    return emptyArray.some.call($this, function(parent) {
                        return $.contains(parent, node);
                    });
                });
            } else if(this.length === 1) {
                result = $(core.qsa(this[0], selector));
            } else {
                result = this.map(function() { return core.qsa(this, selector); });
            }
            return result;
        },
        closest: function(selector, context) {
            var node = this[0], collection = false;
            if(typeof selector === 'object') {
                collection = $(selector);
            }
            while(node && !(collection ? collection.indexOf(node) >= 0 : core.matches(node, selector))) {
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
            return (typeof name === 'string' && value === undefi) ? (this.length === 0 || this[0].nodeType !== 1 ? undefi : (name === 'value' && this[0].nodeName === 'INPUT') ? this.val() : (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
                ) : this.each(function(idx) {
                if(this.nodeType !== 1) {
                    return;
                }
                if(isObject(name)) {
                    for(var key in name) {
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
            return (value === undefi) ? (this[0] && this[0][name]) : this.each(function(idx) {
                this[name] = funcArg(this, value, idx, this[name]);
            });
        },
        data: function(name, value) {
            var data = this.attr('data-' + dasherize(name), value);
            return data !== null ? deserializeValue(data) : undefi;
        },
        val: function(value) {
            return (value === undefi) ? (this[0] && (this[0].multiple ? $(this[0]).find('option').filter(function(o) { return this.selected; }).pluck('value') : this[0].value)
                ) : this.each(function(idx) {
                this.value = funcArg(this, value, idx, this.value);
            });
        },
        offset: function(coordinates) {
            if(coordinates) {
                return this.each(function(index) {
                    var $this = $(this), coords = funcArg(this, coordinates, index, $this.offset()), parentOffset = $this.offsetParent().offset(), props = {
                        top: coords.top - parentOffset.top,
                        left: coords.left - parentOffset.left
                    };

                    if($this.css('position') === 'static') {
                        props['position'] = 'relative';
                    }
                    $this.css(props);
                });
            }
            if(this.length === 0) {return null;}
            var obj = this[0].getBoundingClientRect();
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            };
        },
        css: function(property, value) {
            if(arguments.length < 2 && typeof property === 'string') {
                return this[0] && (this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property));
            }

            var css = '';
            if(type(property) === 'string') {
                if(!value && value !== 0) {
                    this.each(function() { this.style.removeProperty(dasherize(property)); });
                } else {
                    css = dasherize(property) + ':' + maybeAddPx(property, value);
                }
            } else {
                for(var key in property) {
                    if(!property[key] && property[key] !== 0) {
                        this.each(function() { this.style.removeProperty(dasherize(key)); });
                    } else {
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
                    }
                }
            }

            return this.each(function() { this.style.cssText += ';' + css; });
        },
        text: function(text) {
            return text === undefi ? (this.length > 0 ? this[0].textContent : null) : this.each(function() { this.textContent = text; });
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
                    if(!$(this).hasClass(klass)) {
                        classList.push(klass);
                    }
                }, this);
                if (classList.length) {
                    className(this, cls + (cls ? ' ' : ' ') + classList.join(' '));
                }
            });
        },
        removeClass: function(name) {
            return this.each(function(idx) {
                if(name === undefi) {return className(this, '');}
                classList = className(this);
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
                    classList = classList.replace(classRE(klass), ' ');
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
            if(!this.length) {return;}
            return ('scrollTop' in this[0]) ? this[0].scrollTop : this[0].scrollY;
        },
        position: function() {
            if(!this.length) {return;}

            var elem = this[0], // Get *real* offsetParent
                offsetParent = this.offsetParent(), // Get correct offsets
                offset = this.offset(), parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top -= parseFloat($(elem).css('margin-top')) || 0;
            offset.left -= parseFloat($(elem).css('margin-left')) || 0;

            // Add offsetParent borders
            parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
            parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;

            // Subtract the two offsets
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        },
        clone: function() {
            return this.map(function() { return this.cloneNode(true); });
        },
        hide: function() {
            return this.css('display', 'none');
        },
        toggle: function(setting) {
            return this.each(function() {
                var el = $(this), expr;
                if (setting === undefi) {
                    expr = (el.css('display') === 'none');
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
        prev: function(selector) { return $(this.pluck('previousElementSibling')).filter(selector || '*'); },
        next: function(selector) { return $(this.pluck('nextElementSibling')).filter(selector || '*'); },
        remove: function() {
            return this.each(function() {
                if(this.parentNode != null) {
                    this.parentNode.removeChild(this);
                }
            });
        },
        html: function(html) {
            return html === undefi ? (this.length > 0 ? this[0].innerHTML : null) : this.each(function(idx) {
                var originHtml = this.innerHTML;
                $(this).empty().append(funcArg(this, html, idx, originHtml));
            });
        },
        empty: function() {
            return this.each(function() { this.innerHTML = ''; });
        },
        replaceWith: function(newContent) {
            return this.before(newContent).remove();
        },
        wrap: function(structure) {
            var func = $.isFunction(structure);
            if(this[0] && !func) {
                var dom = $(structure).get(0), clone = dom.parentNode || this.length > 1;
            }

            return this.each(function(index) {
                $(this).wrapAll(func ? structure.call(this, index) : clone ? dom.cloneNode(true) : dom);
            });
        },
        wrapAll: function(structure) {
            if(this[0]) {
                $(this[0]).before(structure = $(structure));
                var children;
                // drill down to the inmost element
                while((children = structure.children()).length) {structure = children.first();}
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
            if($.isFunction(selector) && selector.call !== undefi) {
                this.each(function(idx) {
                    if(!selector.call(this, idx)) {
                        nodes.push(this);
                    }
                });
            } else {
                var excludes = typeof selector === 'string' ? this.filter(selector) : (likeArray(selector) && $.isFunction(selector.item)) ? slice.call(selector) : $(selector);
                this.forEach(function(el) {
                    if(excludes.indexOf(el) < 0) {
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
            while(nodes.length > 0) {
                nodes = $.map(nodes, function(node) {
                    if((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node);
                        return node;
                    }
                });
            }
            return filtered(ancestors, selector);
        },
        parent: function(selector) {
            return filtered(uniq(this.pluck('parentNode')), selector);
        },
        children: function(selector) {
            return filtered(this.map(function() { return children(this); }), selector);
        },
        contents: function() {
            return this.map(function() { return slice.call(this.childNodes); });
        },
        siblings: function(selector) {
            return filtered(this.map(function(i, el) {
                return filter.call(children(el.parentNode), function(child) { return child !== el; });
            }), selector);
        },
        pluck: function(property) {
            return $.map(this, function(el) { return el[property] });
        },
        show: function() {
            return this.each(function() {
                if (this.style.display === 'none') {
                    this.style.display = null;
                }
                if(getComputedStyle(this, '').getPropertyValue('display') === 'none') {
                    this.style.display = defaultDisplay(this.nodeName);
                }
            });
        },
        offsetParent: function() {
            return this.map(function() {
                var parent = this.offsetParent || document.body;
                while(parent && !rootNodeRE.test(parent.nodeName) && $(parent).css('position') === 'static') {
                    parent = parent.offsetParent;
                }
                return parent;
            });
        }
    };

    // for now
    $.fn.detach = $.fn.remove;

    // Generate the `width` and `height` functions
    ['width', 'height'].forEach(function(dimension) {
        $.fn[dimension] = function(value) {
            var offset, el = this[0], Dimension = dimension.replace(/./, function(m) { return m[0].toUpperCase(); });
            if(value === undefi) {
                return isWindow(el) ? el['inner' + Dimension] : isDocument(el) ? el.documentElement['offset' + Dimension] : (offset = this.offset()) && offset[dimension];
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
        for(var key in node.childNodes) {
            traverseNode(node.childNodes[key], fun);
        }
    }

    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function(operator, operatorIndex) {
        var inside = operatorIndex % 2; //=> prepend, append

        $.fn[operator] = function() {
            // arguments can be nodes, arrays of nodes, mobi objects and HTML strings
            var argType, nodes = $.map(arguments, function(arg) {
                argType = type(arg);
                return argType === 'object' || argType === 'array' || arg === null ? arg : core.fragment(arg);
            }), parent, copyByClone = this.length > 1;
            if(nodes.length < 1) {
                return this;
            }

            return this.each(function(_, target) {
                parent = inside ? target : target.parentNode;

                // convert all methods to a 'before' operation
                target = operatorIndex === 0 ? target.nextSibling : operatorIndex === 1 ? target.firstChild : operatorIndex === 2 ? target : null;

                nodes.forEach(function(node) {
                    if(copyByClone) {
                        node = node.cloneNode(true);
                    } else if(!parent) {
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
        $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function(html) {
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
    //'$' in window || (window.$ = $);
});
