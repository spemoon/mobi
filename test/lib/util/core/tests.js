/**
 * author: lidian.sw@gmail.com
 * date: 2013.04.15
 */

seajs.use(['../../../../js/lib/util/core'], function($) {

    var alphabetArr = ['a', 'b', 'c'];
    var hash = { name: 'mobi', type: 'core' };
    var node = $('.parent');
    var nodeArray = ['#node1', '.node2', '#node child'];

    module('init方法');
    test('init_空', function() {
        ok($());
        //ok(mobi());
    });

    test('init_isFunction', function() {
        ok($(function() {
            // console.log('isFunction');
        }));
    });

    test('init_isZ', function() {
        var nodeIsZ = $();
        ok($(nodeIsZ));
    });

    test('init_else', function() {
        ok($('#node'));
        ok($('.node'));
        ok($("<p>Hello</p>"));
        ok($("<p />", { text: "Hello", id: "greeting", css: {color: 'darkblue'} }));
        ok($(nodeArray));
    });

    module('语言辅助');
    test('$.camelCase', function() {
        ok($.camelCase('hello-there'));
        ok($.camelCase('helloThere'));
    });

    test('$.contains', function() {
        ok($.contains($('.parent')[0], $('.child')[0]));
        ok($.contains(document.documentElement, document.body));
    });

    test('$.each', function() {
        ok($.each(alphabetArr, function(index, item) {
            // console.log('item %d is: %s', index, item);
        }));
        ok($.each(hash, function(key, value) {
            // console.log('%s: %s', key, value);
        }));
    });

    test('$.extend', function() {
        var target = { one: 'patridge' }, source = { two: 'turtle doves' };
        ok($.extend(target, source));
    });

    test('$.fn', function() {
        ok($.fn.empty = function() {
            return this.each(function() { this.innerHTML = ''; });
        });
    });

    test('$.isPlainObject', function() {
        ok($.isPlainObject({}));
        ok($.isPlainObject(new Object));
        ok(!$.isPlainObject(new Date));
        ok(!$.isPlainObject(window));
    });

    test('$.isWindow', function() {
        ok($.isWindow(window));
    });

    test('$.map', function() {
        ok($.map(alphabetArr, function(a) {
            return a;
        }));
        ok($.map(alphabetArr, function(n, i) {
            return (n.toUpperCase() + i);
        }));
        ok($.map(hash, function(value, index) {
            return (value + index);
        }));
    });

    test('$.parseJSON', function() {
        ok($.parseJSON('{"name":"John"}'));
    });

    test('$.trim', function() {
        ok($.trim("    hello, how are you?    "));
    });

    test('$.type', function() {
        equal($.type("    hello, how are you?    "), 'string');
        equal($.type(" "), 'string');
        equal($.type(new Object), 'object');
        equal($.type({}), 'object');
        equal($.type(1), 'number');
        equal($.type(0), 'number');
        equal($.type(-1), 'number');
        equal($.type(true), 'boolean');
        equal($.type(false), 'boolean');
        equal($.type(function() {}), 'function');
        equal($.type(alphabetArr), 'array');
        equal($.type(null), 'null');
    });

    module('DOM操作——写操作');
    test('push', function() {
        ok($('li').push('<li></li>'));
    });

    test('concat', function() {
        ok($('li').concat($('li')));
    });

    test('slice', function() {
        ok($('li').slice(0, 1));
        ok($('li').slice(0, -1));
    });

    test('after', function() {
        ok(node.after('<p></p>'));
        ok(node.after($('h2')));
        ok(node.after(document.createTextNode("Hello")));
    });

    test('before', function() {
        ok(node.before('<p></p>'));
        ok(node.before($('h2')));
        ok(node.before(document.createTextNode("Hello")));
    });

    test('append', function() {
        ok(node.append('<p></p>'));
        ok(node.append($('h2')));
        ok(node.append(document.createTextNode("Hello")));
    });

    test('appendTo', function() {
        ok($('<p></p>').appendTo(node));
        ok($('h2').appendTo(node));
    });

    test('prepend', function() {
        ok(node.prepend('<p></p>'));
        ok(node.prepend($('h2')));
        ok(node.prepend(document.createTextNode("Hello")));
    });

    test('prependTo', function() {
        ok($('<p></p>').prependTo(node));
        ok($('h2').prependTo(node));
    });

    test('clone', function() {
        ok(node.clone());
    });

    test('remove', function() {
        ok(node.remove('.remove'));
        ok($('.remove1').remove());
    });

    test('empty', function() {
        ok($('.hello').empty());
    });

    test('html', function() {
        ok($('.content').html());
        ok($('.hello').html('xxx'));
        ok($('.hello').html('<p>All new content. <em>You bet!</em></p>'));
    });

    test('text', function() {
        ok($('.content').text());
        ok($('.hello').text('xxx'));
        ok($('.hello').text('<p>All new content. <em>You bet!</em></p>'));
    });

    test('replaceWith', function() {
        ok($('div.second').replaceWith('<h2>New heading</h2>'));
    });

    test('insertAfter', function() {
        ok($('<p>Test</p>').insertAfter('.inner'));
    });

    test('insertBefore', function() {
        ok($('<p>Test</p>').insertBefore('.inner'));
    });

    test('unwrap&wrap', function() {
        if($('.wrap').parent().is('div')) {
            ok($('.wrap').unwrap());
        } else {
            ok($('.wrap').wrap('<div class="hide"></div>'));
        }
    });

    test('wrapAll', function() {
        ok($('.inner').wrapAll('<div class="new" />'));
    });

    test('wrapInner', function() {
        ok($('.inner').wrapInner('<div class="new" />'));
    });

    module('DOM操作——查找操作');
    test('children', function() {
        ok($('.content').children());
        ok($('.content').children('.inner'));
    });

    test('find', function() {
        ok($('.content').find('.inner'));
        ok($('.content').find($('.inner')));
    });

    test('siblings', function() {
        ok($('.contains').siblings());
        ok($('.contains').siblings('.parent'));
        ok($('.contains').siblings($('.parent')));
    });

    test('contents', function() {
        ok($('.contents').contents());
    });

    test('first/last', function() {
        ok($('li').first());
        ok($('li').last());
    });

    test('prev/next', function() {
        ok($('li.third-item').prev());
        ok($('li.third-item').next());
    });

    test('offsetParent', function() {
        ok($('li.third-item').offsetParent());
    });

    test('parent/parents', function() {
        ok($('li.third-item').parent());
        ok($('li.third-item').parents());
        ok($('li.third-item').parents('.content'));
    });

    test('closest', function() {
        ok($('li.third-item').closest());
    });

    test('each', function() {
        ok($('li').each(function(i) {
            $(this).addClass('each' + i);
        }));
    });

    test('filter', function() {
        ok($('li').filter(':even'));
    });

    test('forEach', function() {
        ok($('li').forEach(function(item, index, array) {
            // console.log(item);
        }));
    });

    test('reduce', function() {
        ok($('li').reduce(function(memo, item, index, array) {
            // console.log(memo);
            return true;
        }));
    });

    test('eq', function() {
        ok($('content').find('li').eq(0));
    });

    test('index', function() {
        ok($('li').index('.third-item'));
    });

    test('size', function() {
        ok($('li').size());
    });

    test('is', function() {
        ok($("input[type='checkbox']").parent().is("form"));
    });

    test('not', function() {
        ok($('li').not(':even'));
    });

    test('has', function() {
        ok($('li').has('ul'));
    });

    module('DOM操作——属性操作');
    test('attr', function() {
        ok($('.content').attr('data-alt', 'Beijing Brush Seller'));
        ok($('.content').attr('data-alt'));
        ok($('.content').attr('data-alt', null));
        ok($('.content').attr({
            'data-alt': 'Beijing Brush Seller',
            'data-title': 'test'
        }));
    });

    test('data', function() {
        ok($('.content').data('data-alt', 'Beijing Brush Seller'));
        ok($('.content').data('data-alt'));
    });

    test('removeAttr', function() {
        ok($('.content').removeAttr('data-remove'));
    });

    test('prop', function() {
        ok($("#check1").prop("checked"));
        ok(!$("#check2").prop("checked"));
        ok($("input[type='checkbox']").prop("type", function(index, oldvalue) {
            // console.log(index+"|"+oldvalue);
        }));
    });

    test('val', function() {
        ok($("#text").val(''));
        equal($("#text").val(), '');
        ok($("#text").val("checked"));
        ok($("#text").val(function(index, value) {
            return value;
        }));
    });

    module('DOM操作——样式操作');
    test('css', function() {
        ok($("#text").css('background-color'));
        ok($("#text").css(["width", "height", "color", "background-color"]));
        ok($("#text").css('width', function(index) {
            return index * 50;
        }));
    });

    test('addClass', function() {
        ok(node.addClass('selected'));
        ok(node.addClass('selected highlight'));
    });

    test('removeClass', function() {
        ok(node.removeClass('selected'));
        ok(node.removeClass('selected highlight'));
    });

    test('hasClass', function() {
        ok($('#check1').hasClass('taiyang'));
        ok(!$('#check2').hasClass('highlight'));
    });

    test('toggleClass', function() {
        ok($('#check2').toggleClass('highlight'));
    });

    test('height/width', function() {
        ok($(window).width());
        ok($(window).height());
        ok($('.content').width(600));
        ok($('.content').height(600));
    });

    test('show/hide/toggle', function() {
        ok($('.content').show());
        ok($('.content').toggle());
        ok($('.content').hide());
    });

    test('offset/position', function() {
        ok($('.content').offset());
        ok($('.content').position());
    });

    test('scrollTop', function() {
        equal($('.content').scrollTop(), 0);
    });

    module('其他');
    test('ready', function() {
        ok($(document).ready(function() {
            // console.log('ready');
        }));
    });
});
