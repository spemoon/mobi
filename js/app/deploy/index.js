/**
 * User: caolvchong@gmail.com
 * Date: 5/6/13
 * Time: 4:35 PM
 */
define(function(require, exports, module) {
    var $ = require('$');
    var helper = require('./helper');

    $(function() {
        var req = $.ajaxExt.single('random');
        var btn = $('#btn');
        var val = btn.val();
        btn.click(function() {
            req.send({
                url: './data.php',
                rule: {
                    success: function() {
                        return true;
                    }
                },
                beforeSend: function() {
                    btn.val('waiting...');
                },
                success: function(data) {
                    var serverText = +data.text;
                    var clientText = helper.random();
                    var flag = serverText === clientText;
                    helper.append('server random:' + serverText + ' ; client random:' + clientText + (flag ? ' ---> the same' : ''), $('#box'));
                },
                complete: function() {
                    btn.val(val);
                }
            });
        });
    });
});