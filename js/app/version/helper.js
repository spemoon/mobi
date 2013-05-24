/**
 * User: caolvchong@gmail.com
 * Date: 5/20/13
 * Time: 3:57 PM
 */
define(function(require, exports, module) {
    var r = {
        tail: function(str) {
            return str + ':' + new Date();
        },
        head: function(str) {
            return new Date() + ':' + str;
        }
    };
    module.exports = r;
});