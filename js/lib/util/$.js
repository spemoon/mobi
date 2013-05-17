/**
 * 综合核心库文件,目前包括：
 *     lang.js
 *     core.js
 *     event.js
 *     ajax.js
 *     ajax_ext.js
 *     detect.js
 *     history.js
 * User: caolvchong@gmail.com
 * Date: 5/17/13
 * Time: 2:33 PM
 */
define(function(require, exports, module) {
    var $ = require('./core'); // 默认引入了lang.js
    var event = require('./event'); // 默认注入$
    var ajax = require('./ajax'); // 默认注入$

    var ajaxExt = require('./ajax_ext');
    $.ajaxExt = ajaxExt;

    var detect = require('./detect'); // 默认注入$

    var history = require('./history');
    $.history = history;

    module.exports = $;
});