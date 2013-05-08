/**
 * User: caolvchong@gmail.com
 * Date: 5/6/13
 * Time: 4:35 PM
 */
define(function(require, exports, module) {
    var $ = require('../../lib/util/core');
    var ajax = require('../../lib/util/ajax');
    var helper = require('./helper');

    $(function() {
        $('#btn').click(function() {
            $.get('./data.php', function(data) {
                var serverText = +data.text;
                var clientText = helper.random();
                var flag = serverText === clientText;
                helper.append('server random:' + serverText + ' ; client random:' + clientText + (flag ? ' ---> the same' : ''), $('#box'));
            }, 'json');
        });
    });
});