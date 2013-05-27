/**
 * User: caolvchong@gmail.com
 * Date: 5/17/13
 * Time: 10:13 AM
 */
define(function(require, exports, module) {
    module.exports = function(params) {
        var $ = params.r.$;
        var id = params.p.id;
        $('#box').html('the user id is: ' + (id || 'id not found'));
    };
});