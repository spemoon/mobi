/**
 * User: caolvchong@gmail.com
 * Date: 5/17/13
 * Time: 10:13 AM
 */
define(function(require, exports, module) {
    var helper = require('../helper');
    module.exports = function(params) {
        var $ = params.r.$;
        $('#box').html(helper.tail('my name is Tom hoo'));
    };
});