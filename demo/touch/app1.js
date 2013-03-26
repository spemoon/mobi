(function ($) {

	$(document).ready(function(){
		var touchX = new touch({
			node: 'demo1',
			debugEnabled: true
		});
		touchX.init();

		$('.front, .back').tap(function() {
			var el = $(this).parent();
			el.toggleClass('flipped');
		});
	});

})($);