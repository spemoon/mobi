define(function(require, exports, module) {
    var $ = require('../../js/lib/util/core');
    var event = require('../../js/lib/util/event');
    var touch = require('../../js/lib/util/touch');

    $(function(){
        (function(){

            var node = {
                content: $('.content'),
                tap: $('#tap'),
                singleTap: $('#singleTap'),
                doubleTap: $('#doubleTap'),
                longTap: $('#longTap'),
                swipe: $('#swipe'),
                swipeLeft: $('#swipeLeft'),
                swipeRight: $('#swipeRight'),
                swipeUp: $('#swipeUp'),
                swipeDown: $('#swipeDown')
            };

            node.tap.bind('tap', function(){
                $(this).find('.delete').toggle();
            });

            node.singleTap.bind('singleTap', function(){
                $(this).find('.delete').toggle();
            });

            node.doubleTap.bind('doubleTap', function(){
                $(this).find('.delete').toggle();
            });

            node.longTap.bind('longTap', function(){
                $(this).find('.delete').toggle();
            });

            node.swipe.bind('swipe', function(){
                $(this).find('.delete').toggle();
            });

            node.swipeLeft.bind('swipeLeft', function(){
                $(this).find('.delete').toggle();
            });

            node.swipeRight.bind('swipeRight', function(){
                $(this).find('.delete').toggle();
            });

            node.swipeUp.bind('swipeUp', function(){
                $(this).find('.delete').toggle();
            });

            node.swipeDown.bind('swipeDown', function(){
                $(this).find('.delete').toggle();
            });

        })();
    });

});
