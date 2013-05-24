/**
 * User: caolvchong@gmail.com
 * Date: 5/17/13
 * Time: 10:13 AM
 */
define(function(require, exports, module) {
    return function(params) {
        var $ = params.r.$;
        $('#box').html('home:' + new Date());
    };
});