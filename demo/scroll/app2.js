define(function(require, exports, module) {
    var $ = require('../../js/lib/util/core');
    /*var event = require('../../js/lib/util/event');
    var touch = require('../../js/lib/util/touch');
    var iscroll = require('../../js/lib/util/scroll');*/

    $(function(){
        (function(){

            var node = {
                content: $('#wrapper')
            };

            //强制让内容超过     
            //node.content.css("height", window.innerHeight+100);
            //window.scrollTo(0, 1);
            //重置成新高度     
            //node.content.css("height", window.innerHeight);
            //非常重要，用于兼容不同机型，防止浏览器窗口移动     
            document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

            //var scroll = new iscroll('wrapper');

        })();
    });

});