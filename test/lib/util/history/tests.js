/**
 * User: caolvchong@gmail.com
 * Date: 4/10/13
 * Time: 3:21 PM
 */

seajs.use(['../../../../js/lib/util/history', '../../../../js/lib/util/core'], function(history, $) {
    $(function() {

        var nav = (function() {
            var obj = {};
            $.each(['home', 'info', 'about'], function(i, v) {
                obj[v] = v;
            });
            return obj;
        })();

        module('history路由', {
            setup: function() {
                var html = '<div id="nav">';
                html += '<ul id="nav">';
                html += '    <li class="active">';
                html += '        <a href="#home">Home</a>';
                html += '    </li>';
                html += '    <li>';
                html += '        <a href="#info">Info</a>';
                html += '    </li>';
                html += '    <li>';
                html += '        <a href="#about">About</a>';
                html += '    </li>';
                html += '</ul>';
                html += '<div id="box"></div>';
                html += '</div>';
                $('body').append(html);

                var box = $('#box');
                history.listen({
                    home: function() {
                        box.html(nav.home);
                    },
                    'info/:id': function(id) { // :通配符
                        box.html(id);
                    },
                    '*about': function(str) { // *通配符
                        box.html(str);
                    },
                    defaultRouter: 'info/1'
                });
            },
            teardown: function() {
                $('#nav').remove();
                location.hash = '#';
            }
        });
        asyncTest('history,route', function() {
            var box = $('#box');
            equal(box.html(), 1);

            history.trigger(nav.home, function() {
                equal(box.html(), nav.home);

                var p = 'xyz_';
                history.trigger(p + nav.about, function() {
                    equal(box.html(), p + nav.about);

                    var id = 25;
                    history.trigger(nav.info + '/' + id, function() {
                        equal(box.html(), id);
                        start();
                    });
                });
            });
        });
    });
});