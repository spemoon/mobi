/**
 * 手势相关扩展
 * @author:  @lidian
 * @email:   @lidian.sw@gmail.com
 */

define(function(require, exports, module) {

    var $ = require('../core');
    /**
     * 内部变量初始化
     * @touchDataObj    记录节点在touch事件中数据的变化
     */
    var touchData, touchDataObj = {
            start: {
                x: 0,
                y: 0,
                time: 0
            },
            update: {
                prevPos: {x: 0, y: 0}, // 先前的接触点
                dist: {x: 0, y: 0},      // 相对于原来的接触点距离
                dir: {x: 0, y: 0}        // 触摸方向(-1 left/up, +1 right/down, 0 no)
            },
            end: {
                duration: 0, // 触目持续时间
                speed: {x: 0, y: 0},     // 沿x轴和y轴运动的速度
                flick: {x: 0, y: 0}      // +1/-1 标示 left/right up/down
            }
        };
    var touchIniObjs = 0;  // 计数初始化touch的个数
    var minDistance = 5;  // 滑动的最小计算距离，单位px
    var flickHold = 0.7;   // 判定是否是轻触屏幕
    var browserSupport = false; // 默认不支持CSS3，自动判断
    var debug = false; // debug开关

    /**
     * 辅助函数
     * @type {Object}
     */
    var helper = {
        /**
         * 显示debug的相关窗口
         * @return {[type]} [description]
         */
        _debugger: function() {
            if(!$('#touchDebugger').length) {
                debug = true;
                touchData = touchDataObj;
                touchData.touchLog = [];
                var html = '<div id="touchDebugger" style="position: absolute; bottom: 0; left: 0; overflow-y: auto; margin: 0 auto; padding: 10px; width: 100%; height: 100px; background: #000; color: #fff; font-family: courier, sans-serif;">Debugger</div>';
                $('body').append(html);
            }
        },
        /**
         * 记录touch过程中的各个事件
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        _logTouch: function(e) {
            if(debug) {
                touchData.touchLog.splice(0, 0, e);
                helper._printTouchData();
            }
        },
        /**
         * 打印各个过程中的数值
         * @return {[type]} [description]
         */
        _printTouchData: function() {
            var touchLog = '';
            for(var i = 0; i < 3; i++) {
                touchLog += touchData.touchLog[i] + ' | ';
            }

            var text = '';
            text += '<p>' + touchLog + '</p>';
            text += '<p>star:{x:' + touchData.start.x + ', y:' + touchData.start.y + ', time:' + touchData.start.time + '}</p>';
            text += '<p>update:{</p>';
            text += '<p>prevPos:{x:' + touchData.update.prevPos.x + ', y:' + touchData.update.prevPos.y + '},</p>';
            text += '<p>dist:{x:' + touchData.update.dist.x + ', y:' + touchData.update.dist.y + '},</p>';
            text += '<p>dir:{x:' + touchData.update.dir.x + ', y:' + touchData.update.dir.y + '}</p>';
            text += '<p>}</p>';
            text += '<p>end:{</p>';
            text += '<p>duration:{' + touchData.end.duration + '}</p>';
            text += '<p>speed:{x:' + touchData.end.speed.x + ', y: ' + touchData.end.speed.y + '}</p>';
            text += '<p>flick:{x:' + touchData.end.flick.x + ', y: ' + touchData.end.flick.y + '}</p>';
            text += '<p>}</p>';

            $('#touchDebugger').append(text);

        },
        /**
         * 获取滑动方向
         * @param  {[type]} el        [description]
         * @param  {[type]} direction [description]
         * @return {[type]}           [description]
         */
        getDirection: function(el, direction) {
            if((direction !== 'x') && (direction !== 'y')) {
                direction = (el.height() > el.width()) ? 'y' : 'x';
            }
            return direction;
        },
        /**
         * 获取每段的长度，单位px
         * @param  {[type]} el        [description]
         * @param  {[type]} segmentPx [description]
         * @return {[type]}           [description]
         */
        getSegmentPx: function(el, segmentPx) {
            if(!parseInt(segmentPx, 10)) {
                var segments = el.data('segments');
                var direction = helper.getDirection(el, el.data('direction'));
                segmentPx = (direction === 'y') ? el.height() / segments : el.width() / segments;
            }
            return segmentPx;
        },
        /**
         * 重置触摸过程中的数值
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        resetTouchData: function(e) {
            var pageX, pageY;

            //Android 跟 iOS的 x,y取法不太一样
            pageX = (typeof e.touches[0].pageX !== 'undefined') ? e.touches[0].pageX : e.pageX;
            pageY = (typeof e.touches[0].pageY !== 'undefined') ? e.touches[0].pageY : e.pageY;

            touchData = touchDataObj;
            touchData.start = {x: pageX, y: pageY, time: e.timeStamp};
            touchData.update.prevPos = {x: pageX, y: pageY};

            if(debug) {
                helper._printTouchData();
            }
        },
        /**
         * 更新触摸过程中的数值变化
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        updateTouchData: function(e) {
            var pageX, pageY;

            //Android 跟 iOS的 x,y取法不太一样
            pageX = (typeof e.touches[0].pageX !== 'undefined') ? e.touches[0].pageX : e.pageX;
            pageY = (typeof e.touches[0].pageY !== 'undefined') ? e.touches[0].pageY : e.pageY;

            var dirX;
            var dirY;
            var prevX = pageX;
            var prevY = pageY;
            var distX = pageX - touchData.start.x;
            var distY = pageY - touchData.start.y;

            if(pageX > touchData.update.prevPos.x) {
                dirX = 1;
            } else if(pageX < touchData.update.prevPos.x) {
                dirX = -1;
            } else {
                dirX = 0;
            }

            if(pageY > touchData.update.prevPos.y) {
                dirY = 1;
            } else if(pageY < touchData.update.prevPos.y) {
                dirY = -1;
            } else {
                dirY = 0;
            }

            touchData.update.prevPos = {x: prevX, y: prevY};
            touchData.update.dist = {x: distX, y: distY};
            touchData.update.dir = {x: distX, y: distY};

            if(debug) {
                helper._printTouchData();
            }
        },
        /**
         * 记录触摸结束的数值
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        endTouch: function(e) {

            var duration = (e.timeStamp - touchData.start.time);
            var speedX = Math.abs(Math.round(touchData.update.dist.x / duration * 100) / 100);
            var speedY = Math.abs(Math.round(touchData.update.dist.y / duration * 100) / 100);
            var dirX = touchData.update.dir.x;
            var dirY = touchData.update.dir.y;
            var flickX = 0;
            var flickY = 0;

            if(speedX > flickHold) {
                flickX = (Math.abs(touchData.update.dir.x) >= minDistance) ? dirX : 0;
            } else if(speedY > flickHold) {
                flickY = (Math.abs(touchData.update.dir.y) >= minDistance) ? dirY : 0;
            }

            touchData.end.duration = duration;
            touchData.end.speed = {x: speedX, y: speedY};
            touchData.end.flick = {x: flickX, y: flickY};

            if(debug) {
                helper._printTouchData();
            }
        },
        /**
         * 判断是否支持CSS3
         * @param  {[type]} prop [description]
         * @return {[type]}      [description]
         */
        browserSupport: function(prop) {
            var div = document.createElement('div');
            var vendors = 'Khtml Ms O Moz Webkit'.split(' ');
            var len = vendors.length;

            return function(prop) {
                if(prop in div.style) {return true;}
                prop = prop.replace(/^[a-z]/, function(val) {
                    return val.toUpperCase();
                });
                while(len--) {
                    if(vendors[len] + prop in div.style) {
                        return true;
                    }
                }
                return false;
            };
        }
    };

    /**
     * touch构造器
     * @param  {[type]} params
     *  node            绑定的节点
     *  debugEnabled    是否允许debug,后面会设计一个debug的位置
     *  segments        节点内部包含的段数
     *  segmentPx       每段的长度，单位px
     *  preventDefault  是否阻止默认事件，默认true
     *  flickHold       是否是轻触，默认false
     *  snapSpeed       动画速度
     *  flickSnapSpeed  轻触动画速度
     * @return {[type]}
     */
    var touch = function(params) {
        this.node = typeof params.node === 'string' ? document.getElementById(params.node) : params.node;
        this.debugEnabled = params.debugEnabled || false;
        this.segments = params.segments || 5;
        this.direction = params.direction || 'auto';
        this.segmentPx = params.segmentPx || 'auto';
        this.preventDefault = params.preventDefault || true;
        this.flickHold = params.flickHold || false;
        this.snapSpeed = params.snapSpeed || 0.3;
        this.flickSnapSpeed = params.flickSnapSpeed || 0.3;
    };

    touch.prototype = (function() {
        return {
            constructor: touch,
            /**
             * 初始化定义相关参数
             * @return {[type]} [description]
             */
            init: function() {
                var el = $(this.node);
                var isAlive = el.data('isAlive');
                if(!isAlive) {
                    el.data('isAlive', true).data('pos', 0).data('segment', 0).data('segments', this.segments).data('direction', helper.getDirection(el, this.direction)).data('segmentPx', helper.getSegmentPx(el, this.segmentPx)).data('snapSpeed', this.snapSpeed).data('flickSnapSpeed', this.flickSnapSpeed);
                    this.bind();
                    this.create();
                    if(!helper.browserSupport('transform')) {
                        browserSupport = true;
                    }
                    if(parseInt(this.flickHold, 10)) {
                        flickHold = parseInt(this.flickHold, 10);
                    }
                    if(debug || this.debugEnabled) {
                        helper._debugger();
                    }
                }
            },
            /**
             * 绑定滑动过程中的各事件
             * @return {[type]} [description]
             */
            bind: function() {
                var el = $(this.node);
                var _this = this;
                el.bind({
                    touchstart: function(e) {
                        helper.resetTouchData(e);
                        _this.start();
                    },
                    touchmove: function(e) {
                        if(this.preventDefault) {
                            e.preventDefault();
                        }
                        helper.updateTouchData(e);
                        _this.move();
                    },
                    touchend: function(e) {
                        helper.endTouch(e);
                        _this.end();
                    }
                });
            },
            /**
             * 创建相关节点
             * @param  {Function} callback [description]
             * @return {[type]}            [description]
             */
            create: function(callback) {
                var el = $(this.node);
                touchData = touchDataObj;
                touchIniObjs++;
                helper._logTouch('create');
                if(!el.data('id')) {
                    el.data('id', 'touch-' + touchIniObjs);
                }
                this.scrollToSegment();
                if(typeof callback === 'function') {
                    callback.call(this, touchIniObjs);
                }
            },
            /**
             * 开始准备，设定anchor
             * @param  {Function} callback [description]
             * @return {[type]}            [description]
             */
            start: function(callback) {
                var el = $(this.node);
                var segment = el.data('segment');
                var segmentPx = el.data('segmentPx');
                var anchor = -(segment * segmentPx);
                helper._logTouch('start');

                el.data('anchor', anchor);

                if(typeof callback === 'function') {
                    callback.call(this, touchData);
                }
            },
            /**
             * 过程处理
             * @param  {Function} callback [description]
             * @return {[type]}            [description]
             */
            move: function(callback) {
                var el = $(this.node);
                var style;
                var direction = el.data('direction');
                var anchor = parseInt(el.data('anchor'), 10);
                var pos = anchor + touchData.update.dist[direction];

                if(browserSupport) { //不支持CSS3处理
                    if(direction === 'y') {
                        el.css({
                            'top': pos
                        });
                    } else {
                        el.css({
                            'left': pos
                        });
                    }
                } else {
                    style = (direction === 'y') ? '(0,' + pos + 'px,0)' : '(' + pos + 'px,0,0)';

                    if(typeof document.getElementById(el.attr('id')).style.webkitTransform !== 'undefined') {
                        document.getElementById(el.attr('id')).style.webkitTransform = 'translate3d' + style;
                    } else if(typeof document.getElementById(el.attr('id')).style.mozTransform !== 'undefined') {
                        document.getElementById(el.attr('id')).style.mozTransform = 'translate3d' + style;
                    } else {
                        document.getElementById(el.attr('id')).style.transform = 'translate3d' + style;
                    }
                }

                el.data('pos', pos);

                if(typeof callback === 'function') {
                    callback.call(this, touchData);
                }
            },
            /**
             * 结束数据处理
             * @param  {Function} callback [description]
             * @return {[type]}            [description]
             */
            end: function(callback) {
                var el = $(this.node);
                var direction = el.data('direction');
                var segment = parseInt(el.data('segment'), 10);
                var segments = parseInt(el.data('segments'), 10);
                var segmentPx = parseInt(el.data('segmentPx'), 10);
                var anchor = parseInt(el.data('anchor'), 10);
                var pos = parseInt(el.data('pos'), 10);
                var nearestSeg;

                nearestSeg = (pos < 0) ? Math.abs(Math.round(pos / segmentPx)) : 0;

                if(typeof callback === 'function') {
                    callback.call(this, touchData, segment);
                }

                if(segment === nearestSeg) {
                    if(touchData.end.flick[direction]) {
                        this.flick();
                    }
                }

                if(nearestSeg === (segment + 1)) {
                    this.nextSegment();
                } else if(nearestSeg === (segment - 1)) {
                    this.prevSegment();
                } else {
                    this.segment(nearestSeg);
                }
            },
            /**
             * 滑动到相关段落
             * @param  {[type]} seg [description]
             * @return {[type]}     [description]
             */
            segment: function(seg) {
                var el = $(this.node);
                var segment = parseInt(el.data('segment'), 10);
                var segments = parseInt(el.data('segments'), 10);
                if(typeof seg !== 'undefined') {
                    if(seg >= segments) {
                        seg = segments - 1;
                    } else if(seg < 0) {
                        seg = 0;
                    }
                    if(seg !== segment) {
                        el.data('segment', seg);
                    }
                    this.scrollToSegment();
                }
            },
            /**
             * 下一个段落处理
             * @param  {Function} callback [description]
             * @return {[type]}            [description]
             */
            nextSegment: function(callback) {
                helper._logTouch('nextSegment');
                var el = $(this.node);
                var segment = parseInt(el.data('segment'), 10) + 1;
                this.segment(segment);
                if(typeof callback === 'function') {
                    callback.call(this, touchData, segment);
                }
            },
            /**
             * 上一个段落处理
             * @param  {Function} callback [description]
             * @return {[type]}            [description]
             */
            prevSegment: function(callback) {
                helper._logTouch('prevSegment');
                var el = $(this.node);
                var segment = el.data('segment') - 1;
                this.segment(segment);
                if(typeof callback === 'function') {
                    callback.call(this, touchData, segment);
                }
            },
            /**
             * 移动到相关段落
             * @param  {Function} callback [description]
             * @return {[type]}            [description]
             */
            scrollToSegment: function(callback) {
                var el = $(this.node);
                var direction = el.data('direction');
                var segments = parseInt(el.data('segments'), 10);
                var segment = parseInt(el.data('segment'), 10);
                var segmentPx = parseInt(el.data('segmentPx'), 10);
                var snapSpeed = parseFloat(el.data('snapSpeed'), 10);
                var flickSnapSpeed = parseFloat(el.data('flickSnapSpeed'), 10);
                var pos = -(segment * segmentPx);
                var easing = 'ease-out';
                var style;

                if(touchData.end.flick.x || touchData.end.flick.y) {
                    snapSpeed = flickSnapSpeed;
                    easing = 'cubic-bezier(0, .70, .35, 1)';
                }

                el.data('anchor', pos).data('pos', pos).data('segment', segment);

                if(browserSupport) { //浏览器不支持css3
                    if(direction === 'y') {
                        el.animate({top: pos}, snapSpeed, easing);
                    } else {
                        el.animate({left: pos}, snapSpeed, easing);
                    }
                } else {
                    style = (direction === 'y') ? '0px, ' + pos + 'px, 0px' : pos + 'px, 0px, 0px';
                    el.animate({translate3d: style}, snapSpeed, easing);
                }
                if(typeof callback === 'function') {
                    callback.call(this, touchData, segment);
                }
            },
            /**
             * 轻触处理，这里是归为段落滑动处理了
             * @param  {Function} callback [description]
             * @return {[type]}            [description]
             */
            flick: function(callback) {
                helper._logTouch('flick');
                var el = $(this.node);

                if(touchData.end.flick.x === 1) {
                    this.flickRight();
                } else if(touchData.end.flick.y === -1) {
                    this.flickLeft();
                }

                if(touchData.end.flick.y === 1) {
                    this.flickDown();
                } else if(touchData.end.flick.y === -1) {
                    this.flickUp();
                }
                if(typeof callback === 'function') {
                    callback.call(this, touchData);
                }
            },
            flickRight: function(callback) {
                helper._logTouch('flickRight');
                this.prevSegment();
                if(typeof callback === 'function') {
                    callback.call(this, touchData);
                }
            },
            flickLeft: function(callback) {
                helper._logTouch('flickLeft');
                this.nextSegment();
                if(typeof callback === 'function') {
                    callback.call(this, touchData);
                }
            },
            flickDown: function(callback) {
                helper._logTouch('flickDown');
                this.prevSegment();
                if(typeof callback === 'function') {
                    callback.call(this, touchData);
                }
            },
            flickUp: function(callback) {
                helper._logTouch('flickUp');
                this.nextSegment();
                if(typeof callback === 'function') {
                    callback.call(this, touchData);
                }
            }
        };
    })();

    this.touch = touch;
});