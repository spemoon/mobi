/**
 * User: caolvchong@gmail.com
 * Date: 5/6/13
 * Time: 4:35 PM
 */
define(function(require, exports, module) {
    var $ = require('../../lib/util/core');

    $.fn.xpend = function(text) {
        this.append('<div>' + text + '</div>');
        return this;
    }

    exports.append = function(text, node) {
        $(node).xpend(text);
    }

    exports.random = function(max, min) {
        max = isNaN(-max) ? 100 : max;
        min = isNaN(-min) ? 0 : min;
        return parseInt(Math.random() * (max - min + 1) + min, 10);
    };
});