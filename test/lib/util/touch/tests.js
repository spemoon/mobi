/**
 * author: lidian.sw@gmail.com
 * Date: 2013.04.22 
 */

seajs.use(['../../../../js/lib/util/event', '../../../../js/lib/util/touch', '../../../../js/lib/util/core'], function(event, touch, $) {
    $(function() {
        var text = {
            hello: 'hello',
            world: 'world'
        };
        var box, btn, result;

        module('Touch event', {
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
        test('tap', function() {
            btn.tap(function() {
                result.text(text.hello);
            });
            btn.trigger('tap');
            equal(result.text(), text.hello);
        });

        test('singleTap', function() {
            btn.bind('singleTap', function() {
                result.text(text.hello);
            });
            btn.trigger('singleTap');
            equal(result.text(), text.hello);
        });

        test('doubleTap', function() {
            btn.bind('doubleTap', function() {
                result.text(text.hello);
            });
            btn.trigger('doubleTap');
            equal(result.text(), text.hello);
        });

        test('longTap', function() {
            btn.bind('longTap', function() {
                result.text(text.hello);
            });
            btn.trigger('longTap');
            equal(result.text(), text.hello);
        });

        test('swipe', function() {
            btn.bind('swipe', function() {
                result.text(text.hello);
            });
            btn.trigger('swipe');
            equal(result.text(), text.hello);
        });

        test('swipeLeft', function() {
            btn.bind('swipeLeft', function() {
                result.text(text.hello);
            });
            btn.trigger('swipeLeft');
            equal(result.text(), text.hello);
        });

        test('swipeRight', function() {
            btn.bind('swipeRight', function() {
                result.text(text.hello);
            });
            btn.trigger('swipeRight');
            equal(result.text(), text.hello);
        });

        test('swipeUp', function() {
            btn.bind('swipeUp', function() {
                result.text(text.hello);
            });
            btn.trigger('swipeUp');
            equal(result.text(), text.hello);
        });

        test('swipeDown', function() {
            btn.bind('swipeDown', function() {
                result.text(text.hello);
            });
            btn.trigger('swipeDown');
            equal(result.text(), text.hello);
        });
    });
});