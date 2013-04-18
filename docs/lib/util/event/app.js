/**
 * User: caolvchong@gmail.com
 * Date: 4/17/13
 * Time: 2:33 PM
 */
define(function(require, exports, module) {
    var $ = require('jquery');
    var event = require('../../../../js/lib/util/event');

    var o = {};
    event.mixTo(o);

    o.on('say', function(name, word) {
        console.log(name + ':' + word);
    });

    o.trigger('say', 'tom', 'nice to meet you');

    $(function() {
        var node = document.getElementById('btn1');
        event.mixTo(node);
        node.on('click', function(e) {
            console.log(1, e);
        });
        node.on('click', function(e) {
            console.log(2, e);
        });
    });
});