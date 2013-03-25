/**
 * 手势相关扩展
 * @author:  @lidian
 * @email:   @lidian.sw@gmail.com
 */

 ;(function($) {

	/**
	 * 内部变量初始化
	 * @touchDataObj    记录节点在touch事件中数据的变化
	 */
	var touchData,
        touchDataObj = {
			start: {
				x: 0,
				y: 0,
				time: 0
			},
			update:	{
				prevPos:  {x:0, y:0},	// 先前的接触点
				dist:  {x:0, y:0},      // 相对于原来的接触点距离
				dir:  {x:0, y:0}        // 触摸方向(-1 left/up, +1 right/down, 0 no)
			},
			end: {
				duration: 0,			// 触目持续时间
				speed:  {x:0, y:0},     // 沿x轴和y轴运动的速度
				flick:  {x:0, y:0}      // +1/-1 标示 left/right up/down
			}
		},
		touchIniObjs = 0;  // 计数初始化touch的个数
		minDistance  = 5;  // 滑动的最小计算距离，单位px
		flickHold    = 0.7;   // 判定是否是轻触屏幕
		browserSupport = false; // 默认不支持CSS3，自动判断
		debug        = false; // debug开关

	/**
	 * 辅助函数
	 * @type {Object}
	 */
	var helper = {
		_debugger: function(){

		},
		getDirection: function(el, direction){
			if ((direction !== 'x') && (direction !== 'y')) {
				direction = (el.height() > el.width()) ? 'y' : 'x';
			}
			return direction;
		},
		getSegmentPx: function(el, segmentPx){
			if(!parseInt(segmentPx)){
				var segments  = el.data('segments');
				var direction = helper.getDirection(el, el.data('direction'));
				segmentPx = (direction == 'y') ? el.height() / segments : el.width() / segments;
			}
			return segmentPx;
		},
		resetTouchData: function(e) {
			var pageX, pageY;

			//Android 跟 iOS的 x,y取法不太一样
			pageX = (typeof e.touches[0].pageX != 'undefined') ? e.touches[0].pageX : e.pageX;
			pageY = (typeof e.touches[0].pageY != 'undefined') ? e.touches[0].pageY : e.pageY;

			touchData               = touchDataObj;
			touchData.start         = {x: pageX, y: pageY, time: e.timeStamp};
			touchData.update.prevPos = {x: pageX, y: pageY};

			if (debug) {
				helper._debugger();
			}
		},
		updateTouchData: function(e){
			var pageX, pageY;

			//Android 跟 iOS的 x,y取法不太一样
			pageX = (typeof e.touches[0].pageX != 'undefined') ? e.touches[0].pageX : e.pageX;
			pageY = (typeof e.touches[0].pageY != 'undefined') ? e.touches[0].pageY : e.pageY;

			var dirX;
			var dirY;
			var prevX = pageX;
			var prevY = pageY;
			var distX = pageX - touchData.start.x;
			var distY = pageY - touchData.start.y;

			if (pageX > touchData.update.prevPos.x) {
				dirX = 1;
			} else if (pageX < touchData.update.prevPos.x) {
				dirX = -1;
			} else {
				dirX = 0;
			}

			if (pageY > touchData.update.prevPos.y) {
				dirY = 1;
			} else if (pageY < touchData.update.prevPos.y) {
				dirY = -1;
			} else {
				dirY = 0;
			}

			touchData.update.prevPos = {x: prevX, y: prevY};
			touchData.update.dist    = {x: distX, y: distY};
			touchData.update.dir     = {x: distX, y: distY};

			if (debug) {
				helper._debugger();
			}
		},
		endTouch: function(e){

			var duration = (e.timeStamp - touchData.start.time);
			var speedX = Math.abs(Math.round(touchData.update.dist.x / duration * 100) / 100);
			var speedY = Math.abs(Math.round(touchData.update.dist.y / duration * 100) / 100);
			var dirX = touchData.update.dir.x;
			var dirY = touchData.update.dir.y;
			var flickX = 0;
			var flickY = 0;

			if (speedX > flickHold) {
				flickX = (Math.abs(touchData.update.dir.x) >= minDistance) ? dirX : 0;
			} else if (speedY > flickHold) {
				flickY = (Math.abs(touchData.update.dir.y) >= minDistance) ? dirY : 0;
			}

			touchData.end.duration = duration;
			touchData.end.speed    = {x: speedX, y: speedY};
			touchData.end.flick    = {x: flickX, y: flickY};

			if (debug) {
				helper._debugger();
			}
		},
		browserSupport: function(prop){
			var div     = document.createElement('div');
			var vendors = 'Khtml Ms O Moz Webkit'.split(' ');
			var len     = vendors.length;

			return function(prop) {
				if ( prop in div.style ) return true;
					prop = prop.replace(/^[a-z]/, function(val) {
					return val.toUpperCase();
				});
				while(len--) {
					if ( vendors[len] + prop in div.style ) {
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
	 * @return {[type]}
	 */
	var touch = function(params) {
		this.node           = typeof params.node == 'string' ? document.getElementById(params.node) : params.node;
		this.debugEnabled   = params.debugEnabled || false;
		this.segments       = params.segments || 5;
		this.direction      = params.direction || 'auto';
		this.segmentPx      = params.segmentPx || 'auto';
		this.preventDefault = params.preventDefault || true;
		this.flickHold      = params.flickHold || false;
		this.snapSpeed      = params.snapSpeed || 0.3;
		this.flickSnapSpeed = params.flickSnapSpeed || 0.3;
		this.onCreate       = params.onCreate || false;
		this.onStart        = params.onStart || false;
		this.onMove         = params.onMove || false;
		this.onEnd          = params.onEnd || false;
	};

	touch.prototype = (function(){
		return {
            constructor: touch,
			init: function(){
				var el      = $(this.node);
				var isAlive = el.data('isAlive');
				if (!isAlive) {
					el.data('isAlive', true)
                         .data('pos', 0)
                         .data('segment', 0)
                         .data('segments', this.segments)
                         .data('direction', helper.getDirection(el, this.direction))
                         .data('segmentPx', helper.getSegmentPx(el, this.segmentPx))
                         .data('snapSpeed', this.snapSpeed)
                         .data('flickSnapSpeed', this.flickSnapSpeed);
                    this.bind();
                    this.create();
                    if(!helper.browserSupport('transform')){
							browserSupport = true;
					}
					if(parseInt(this.flickHold)){
						flickHold = parseInt(this.flickHold);
					}
				}
			},
			bind: function(){
				var el = $(this.node);
				var _this = this;
				/*el.bind({
					'onCreate': this.create.call(this.onCreate),
					'onStart': this.start.call(this.onStart),
					'onMove': this.move.call(this.onMove),
					'onEnd': this.end.call(this.onEnd)
				});*/
				el.bind({
					touchstart: function(e){
						helper.resetTouchData(e);
						_this.start();
					},
					touchmove: function(e){
						if(this.preventDefault) {
							e.preventDefault();
						}
						helper.updateTouchData(e);
						_this.move();
					},
					touchend: function(e){
						helper.endTouch(e);
						_this.end();
					}
				});
			},
			create: function(callback){
				var el        = $(this.node);
				touchData = touchDataObj;
				touchIniObjs++;
				console.log('create');
				if (!el.data('id')) {
					el.data('id', 'touch-' + touchIniObjs);
				}
				this.scrollToSegment();
				if (typeof callback == 'function') {
					callback.call(this, touchIniObjs);
				}
			},
			start: function(callback){
				var el = $(this.node);
				var segment = el.data('segment');
				var segmentPx = el.data('segmentPx');
				var anchor = -(segment * segmentPx);

				el.data('anchor', anchor);

				if (typeof callback == 'function') {
					callback.call(this, touchData);
				}
			},
			move: function(callback){
				var el = $(this.node);
				var style;
				var direction = el.data('direction');
				var anchor = parseInt(el.data('anchor'));
				var pos = anchor + touchData.update.dist[direction];

				if (browserSupport) { //不支持CSS3处理
					if (direction == 'y') {
						el.css({
							'top': pos
						});
					} else {
						el.css({
							'left': pos
						});
					}
				} else {
					style = (direction == 'y') ? '(0,'+pos+'px,0)' : '('+pos+'px,0,0)';

					if(typeof document.getElementById(el.attr('id')).style.webkitTransform != 'undefined') {
						document.getElementById(el.attr('id')).style.webkitTransform = 'translate3d'+style;
					} else if (typeof document.getElementById(el.attr('id')).style.mozTransform != 'undefined') {
						document.getElementById(el.attr('id')).style.mozTransform = 'translate3d'+style;
					} else {
						document.getElementById(el.attr('id')).style.transform = 'translate3d'+style;
					}
				}

				el.data('pos', pos);

				if (typeof callback == 'function') {
					callback.call(this, touchData);
				}
			},
			end: function(callback){
				var el        = $(this.node);
				var direction = el.data('direction');
				var segment   = parseInt(el.data('segment'));
				var segments  = parseInt(el.data('segments'));
				var segmentPx = parseInt(el.data('segmentPx'));
				var anchor    = parseInt(el.data('anchor'));
				var pos       = parseInt(el.data('pos'));
				var nearestSeg;

				nearestSeg = (pos < 0) ? Math.abs(Math.round( pos / segments)) : 0;

				if (typeof callback == 'function') {
					callback.call(this, touchData, segment);
				}

				if (segment == nearestSeg) {
					if (touchData.end.flick[direction]) {
						this.flick();
					}
				}

				if (nearestSeg == (segment + 1)) {
					this.nextSegment();
				} else if (nearestSeg == (segment - 1)) {
					this.prevSegment();
				} else {
					this.segment(nearestSeg);
				}
			},
			segment: function (seg) {
				var el       = $(this.node);
				var segment  = parseInt(el.data('segment'));
				var segments = parseInt(el.data('segments'));
				if (!seg) {
					if (seg >= segments) {
						seg = segments - 1;
					} else if (seg < 0) {
						seg = 0;
					}
					if (seg != segment) {
						el.data('segment', seg);
					}
					this.scrollToSegment();
				}
			},
			nextSegment: function(callback){
				console.log('nextSegment');
				var segment = parseInt(this.node.data('segment')) + 1;
				this.segment(segment);
				if (typeof callback == 'function') {
					callback.call(this, touchData, segment);
				}
			},
			prevSegment: function(callback){
				console.log('prevSegment');
				var segment = this.node.data('segment') - 1;
				this.segment(segment);
				if (typeof callback == 'function') {
					callback.call(this, touchData, segment);
				}
			},
			scrollToSegment: function(callback) {
				var el             = $(this.node);
				var direction      = el.data('direction');
				var segments       = parseInt(el.data('segments'));
				var segment        = parseInt(el.data('segment'));
				var segmentPx      = parseInt(el.data('segmentPx'));
				var snapSpeed      = parseFloat(el.data('snapSpeed'));
				var flickSnapSpeed = parseFloat(el.data('flickSnapSpeed'));
				var pos            = -(segment * segmentPx);
				var easing         = 'ease-out';
				var style;

				console.log(touchData);
				if (touchData.end.flick.x || touchData.end.flick.y) {
					snapSpeed = flickSnapSpeed;
					easing = 'cubic-bezier(0, .70, .35, 1)';
				}

				el.data('anchor', pos).data('pos', pos).data('segment', segment);

				if (browserSupport) { //浏览器不支持css3
					if (direction == 'y') {
						el.animate({top: pos}, snapSpeed, easing);
					} else {
						el.animate({left: pos}, snapSpeed, easing);
					}
				} else {
					style = (direction == 'y') ? '0px, '+pos+'px, 0px' : pos+'px, 0px, 0px';
					el.animate({translate3d: style}, snapSpeed, easing);
				}
				if (typeof callback == 'function') {
					callback.call(this, touchData, segment);
				}
			},
			flick: function(callback){
				var el = $(this.node);

				if (touchData.end.flick.x == 1) {
					this.flickRight();
				} else if (touchData.end.flick.y == -1) {
					this.flickLeft();
				}

				if (touchData.end.flick.y == 1) {
					this.flickDown();
				} else if (touchData.end.flick.y == -1) {
					this.flickUp();
				}
				if (typeof callback == 'function') {
					callback.call(this, touchData);
				}
			},
			flickRight: function (callback) {
				console.log('flickRight');
				this.prevSegment();
				if (typeof callback == 'function') {
					callback.call(this, touchData);
				}
			},
			flickLeft: function (callback) {
				console.log('flickLeft');
				this.nextSegment();
				if (typeof callback == 'function') {
					callback.call(this, touchData);
				}
			},
			flickDown: function (callback) {
				console.log('flickDown');
				this.prevSegment();
				if (typeof callback == 'function') {
					callback.call(this, touchData);
				}
			},
			flickUp: function (callback) {
				console.log('flickDown');
				this.nextSegment();
				if (typeof callback == 'function') {
					callback.call(this, touchData);
				}
			}
		};
	})();

	this.touch = touch;

 })($);