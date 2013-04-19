/**
 * User: caolvchong@gmail.com
 * Date: 4/10/13
 * Time: 3:21 PM
 */

seajs.use(['../../../../js/lib/util/event', '../../../../js/lib/util/core'], function(event, $) {
    $(function() {
        var text = {
            hello: 'hello',
            world: 'world'
        };
        var box, btn, result;

        module('常规DOM事件', {
            setup: function() {
                $('body').append('<div id="box"><input id="btn" type="button" value="click"/><span id="result"></span></div>');
                box = $('#box');
                btn = $('#btn');
                result = $('#result');
            },
            teardown: function() {
                $('#box').remove();
            }
        });
        test('click', function() {
            btn.click(function() {
                result.text(text.hello);
            });
            btn.trigger('click');
            equal(result.text(), text.hello);
        });

        test('bind click', function() {
            btn.bind('click', function() {
                result.text(text.hello);
            });
            btn.trigger('click');
            equal(result.text(), text.hello);
        });

        test('unbind click', function() {
            btn.bind('click', function() {
                result.text(text.hello);
            });
            result.text(text.world);
            btn.unbind('click');
            btn.trigger('click');
            equal(result.text(), text.world);
        });

        test('one click', function() {
            btn.one('click', function() {
                result.text(text.hello);
            });
            btn.trigger('click');
            equal(result.text(), text.hello);
            result.text(text.world);
            btn.trigger('click');
            equal(result.text(), text.world);
        });

        test('click namespace 未完成', function() {
            var w1 = 'hello';
            var w2 = 'world';
            var btn = $('#btn');
            var result = $('#result');
            btn.bind('click.hello', function() {
                result.text(w1);
            });
            btn.bind('click.world', function() {
                result.text(w2);
            });
            btn.trigger('click.world');
            // equal(result.text(), w2);
            btn.trigger('click.hello');
            // equal(result.text(), w1);
            btn.trigger('click');
            // equal(result.text(), w2);
            ok(true);
        });

        test('delegate', function() {
            box.delegate('input', 'click', function() {
                result.text(this.value);
            });
            box.append('<input type="button" value="add" id="btn2"/>');
            btn.trigger('click');
            equal(result.text(), 'click');
            $('#btn2').trigger('click');
            equal(result.text(), 'add');
        });

        test('undelegate', function() {
            box.delegate('input', 'click', function() {
                result.text(this.value);
            });
            box.undelegate('input', 'click');
            result.text(text.hello);
            btn.trigger('click');
            equal(result.text(), text.hello);
        });

        module('自定义事件 未完成');
    });
});