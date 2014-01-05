define(function(require, exports, module) {
    var $ = require('../../js/lib/util/core');
	var touch = require('../../js/lib/util/touch/touch');

	$(function(){
        (function(){

            //强制让内容超过     
			$('#demo1-wrapper').css("height", window.innerHeight+100);
			window.scrollTo(0, 1);
			//重置成新高度     
			$("#demo1-wrapper").css("height", window.innerHeight);
			//非常重要，用于兼容不同机型，防止浏览器窗口移动     
			document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
			var touchX = new touch({
				node: 'demo1',
				smooth: true
				//debugEnabled: true
			});
			touchX.init();

        })();
    });
});