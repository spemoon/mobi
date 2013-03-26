(function ($) {

	$(document).ready(function(){
		//强制让内容超过     
		$('#main').css("height",window.innerHeight+100);
		window.scrollTo(0, 1);
		//重置成新高度     
		$("#main").css("height",window.innerHeight);
		//非常重要，用于兼容不同机型，防止浏览器窗口移动     
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
		var touchX = new touch({
			node: 'demo1'
			//debugEnabled: true
		});
		touchX.init();

		$('.front, .back').tap(function() {
			var el = $(this).parent();
			el.toggleClass('flipped');
		});
	});

})($);