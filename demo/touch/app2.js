(function ($) {

	$(document).ready(function(){
		//强制让内容超过     
		$('#demo2-wrapper').css("height", window.innerHeight+100);
		window.scrollTo(0, 1);
		//重置成新高度     
		$("#demo2-wrapper").css("height", window.innerHeight);
		//非常重要，用于兼容不同机型，防止浏览器窗口移动     
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
		$('#demo2 img').each(function(i){
			new touch({
				node: $(this),
				segments: 3
			}).init();
		});
	});

})($);