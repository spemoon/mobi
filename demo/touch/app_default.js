define(function(require, exports, module) {
    var $ = require('../../js/lib/util/core');
    var event = require('../../js/lib/util/event');
    var touch = require('../../js/lib/util/touch');
    var iscroll = require('../../js/lib/util/scroll');

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

            //强制让内容超过     
            node.content.css("height", window.innerHeight+100);
            window.scrollTo(0, 1);
            //重置成新高度     
            node.content.css("height", window.innerHeight);
            //非常重要，用于兼容不同机型，防止浏览器窗口移动     
            document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

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

            var scroll = new iscroll('wrapper');

        })();
    });

});
