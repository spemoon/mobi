/**
 * User: caolvchong@gmail.com
 * Date: 4/10/13
 * Time: 3:21 PM
 */

seajs.use(['../../../../js/lib/util/detect'], function(detect) {

    var UA = {
        WEBOS_1_4_0_PRE: 'Mozilla/5.0 (webOS/1.4.0; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2 Pre/1.1',
        WEBOS_1_4_0_PIXI: 'Mozilla/5.0 (webOS/1.4.0; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2 Pixi/1.1',
        WEBOS_1_2_9_PIXI: 'Mozilla/5.0 (webOS/Palm webOS 1.2.9; U; en-US) AppleWebKit/525.27.1 (KHTML, like Gecko) Version/1.0 Safari/525.27.1 Pixi/1.0',
        WEBOS_3_0_0_TOUCHPAD: 'Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.0; U; en-US) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/233.70 Safari/534.6 TouchPad/1.0',

        IOS_3_0_IPHONE: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0 like Mac OS X; en-us) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/1A542a Safari/419.3',
        IOS_4_0_IPHONE: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7',
        IOS_3_1_1_IPOD: 'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_1_1 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Mobile/7C145',
        IOS_3_2_IPAD: 'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B367 Safari/531.21.10',
        IOS_4_2_IPAD: 'Mozilla/5.0 (iPad; U; CPU OS 4_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C134 Safari/6533.18.5',
        IOS_4_3_IPHONE_SIMULATOR: 'Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8F190 Safari/6533.18.5',
        IOS_5_0_IPHONE: 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
        IOS_6_0_IPAD_MINI: 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A406 Safari/8536.25',
        IOS_6_1_IPHONE: 'Mozilla/5.0 (iPhone; CPI iPhone OS 6_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B143 Safari/8536.25',

        IOS_3_2_IPAD_2: 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10',

        ANDROID_1_5: 'Mozilla/5.0 (Linux; U; Android 1.5; de-; HTC Magic Build/PLAT-RC33) AppleWebKit/528.5+ (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1',
        ANDROID_2_1: 'Mozilla/5.0 (Linux; U; Android 2.1-update1; en-us; Nexus One Build/ERE27) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17 Chrome/4.1.249.1025',
        ANDROID_4_1_1: 'Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03O) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19',
        ANDROID_4_1_1_TABLET: 'Mozilla/5.0 (Linux; Android 4.1.1; Nexus 7 Build/JRO03S) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Safari/535.19',

        BLACKBERRY_6_0_0_141: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en-GB) AppleWebKit/534.1+ (KHTML, like Gecko) Version/6.0.0.141 Mobile Safari/534.1+',
        PLAYBOOK_1_0_0: 'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 1.0.0; en-US) AppleWebKit/534.8+ (KHTML, like Gecko) Version/0.0.1 Safari/534.8+',
        PLAYBOOK_2_1_0: 'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML, like Gecko) Version/7.2.1.0 Safari/536.2+',
        BB10: 'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.1+ (KHTML, like Gecko) Version/10.0.0.1337 Mobile Safari/537.1+',

        OPERA_11_51: 'Opera/9.80 (Macintosh; Intel Mac OS X 10.7.1; U; en) Presto/2.9.168 Version/11.51',
        OPERA_MOBILE_SIMULATOR: 'Opera/9.80 (Macintosh; Intel Mac OS X; Opera Mobi/[BUILD_NR]; U; en) Presto/2.7.81 Version/11.00',

        KINDLE: 'Mozilla/5.0 (Linux; U; en-US) AppleWebKit/528.5+ (KHTML, like Gecko, Safari/528.5+) Version/4.0 Kindle/3.0 (screen 600×800; rotate)',
        SILK_1_0_ACCEL: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.0.13.328_10008910) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true',
        SILK_1_0: 'Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Kindle Fire Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',

        CHROME_ANDROID_18_0: 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
        CHROME_IOS_19_0: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 5_1_1 like Mac OS X; en) AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3',
        CHROME_OSX_24_0: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.56 Safari/537.17',

        FIREFOX_13_TABLET: 'Mozilla/5.0 (Android; Tablet; rv:13.0) Gecko/13.0 Firefox/13.0',
        FIREFOX_13_PHONE: 'Mozilla/5.0 (Android; Mobile; rv:13.0) Gecko/13.0 Firefox/13.0',
        FIREFOX_6_0_2: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:6.0.2) Gecko/20100101 Firefox/6.0.2',
        FIREFOX_MOBILE_SIMULATOR: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:2.1.1) Gecko/ Firefox/4.0.2pre Fennec/4.0.1',

        WINDOWS_RT_SURFACE: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; ARM; Trident/6.0; Touch)',
        WINDOWS_PHONE_8: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; HTC; Windows Phone 8X by HTC)'
    };

    module('WebOS');
    test('WEBOS_1_4_0_PRE', function() {
        var o = detect(UA.WEBOS_1_4_0_PRE);
        var os = o.os;
        var browser = o.browser;
        ok(os.webos);
        ok(!os.touchpad);
        ok(browser.webkit);
        equal('1.4.0', os.version);
    });
    test('WEBOS_1_4_0_PIXI', function() {
        var o = detect(UA.WEBOS_1_4_0_PIXI);
        var os = o.os;
        ok(os.webos);
        equal('1.4.0', os.version);
    });
    test('WEBOS_1_2_9_PIXI', function() {
        var o = detect(UA.WEBOS_1_2_9_PIXI);
        var os = o.os;
        ok(os.webos);
        equal('1.2.9', os.version);
    });
    test('WEBOS_3_0_0_TOUCHPAD', function() {
        var o = detect(UA.WEBOS_3_0_0_TOUCHPAD);
        var os = o.os;
        ok(os.webos);
        ok(os.touchpad);
        equal('3.0.0', os.version);
    });

    module('Android');
    test('ANDROID_1_5', function() {
        var o = detect(UA.ANDROID_1_5);
        var os = o.os;
        var browser = o.browser;
        ok(os.android);
        ok(browser.webkit);
        equal('1.5', os.version);
        ok(os.phone);
    });
    test('ANDROID_2_1', function() {
        var o = detect(UA.ANDROID_2_1);
        var os = o.os;
        var browser = o.browser;
        ok(os.android);
        ok(browser.webkit);
        equal('2.1', os.version);
        ok(os.phone);
    });
    test('ANDROID_4_1_1', function() {
        var o = detect(UA.ANDROID_4_1_1);
        var os = o.os;
        var browser = o.browser;
        ok(os.android);
        ok(browser.webkit);
        ok(!os.ios);
        equal('4.1.1', os.version);
        ok(os.phone);
        ok(!os.iphone);
        ok(browser.chrome);
    });
    test('ANDROID_4_1_1_TABLET', function() {
        var o = detect(UA.ANDROID_4_1_1_TABLET);
        var os = o.os;
        var browser = o.browser;
        ok(os.android);
        ok(browser.webkit);
        equal('4.1.1', os.version);
        ok(os.tablet);
        ok(browser.chrome);
    });

    module('IOS');
    test('IOS_3_0_IPHONE', function() {
        var o = detect(UA.IOS_3_0_IPHONE);
        var os = o.os;
        var browser = o.browser;
        ok(os.ios);
        ok(os.iphone);
        ok(browser.webkit);
        equal('3.0', os.version);
        equal('420.1', browser.version);
        ok(os.phone);
    });
    test('IOS_3_1_1_IPOD', function() {
        var o = detect(UA.IOS_3_1_1_IPOD);
        var os = o.os;
        ok(os.ios);
        ok(os.iphone);
        equal('3.1.1', os.version);
        ok(os.phone);
    });
    test('IOS_3_2_IPAD', function() {
        var o = detect(UA.IOS_3_2_IPAD);
        var os = o.os;
        var browser = o.browser;
        ok(os.ios);
        ok(os.ipad);
        equal('3.2', os.version);
        ok(os.tablet);
    });
    test('IOS_3_2_IPAD_2', function() {
        var o = detect(UA.IOS_3_2_IPAD_2);
        var os = o.os;
        var browser = o.browser;
        ok(os.ios);
        ok(os.ipad);
        equal('3.2', os.version);
        ok(os.tablet);
    });
    test('IOS_4_0_IPHONE', function() {
        var o = detect(UA.IOS_4_0_IPHONE);
        var os = o.os;
        var browser = o.browser;
        ok(os.ios);
        ok(os.iphone);
        equal('4.0', os.version);
        ok(os.phone);
    });
    test('IOS_4_2_IPAD', function() {
        var o = detect(UA.IOS_4_2_IPAD);
        var os = o.os;
        ok(os.ios);
        ok(os.ipad);
        equal('4.2', os.version);
        ok(os.tablet);
    });
    test('IOS_4_3_IPHONE_SIMULATOR', function() {
        var o = detect(UA.IOS_4_3_IPHONE_SIMULATOR);
        var os = o.os;
        ok(os.ios);
        ok(os.iphone);
        equal('4.3', os.version);
        ok(os.phone);
    });
    test('IOS_5_0_IPHONE', function() {
        var o = detect(UA.IOS_5_0_IPHONE);
        var os = o.os;
        ok(os.ios);
        ok(os.iphone);
        equal('5.0', os.version);
        ok(os.phone);
    });
    test('IOS_6_1_IPHONE', function() {
        var o = detect(UA.IOS_6_1_IPHONE);
        var os = o.os;
        ok(os.ios);
        ok(os.iphone);
        equal('6.1', os.version);
        ok(os.phone);
    });
    test('IOS_6_0_IPAD_MINI', function() {
        var o = detect(UA.IOS_6_0_IPAD_MINI);
        var os = o.os;
        ok(os.ios);
        ok(os.ipad);
        equal('6.0', os.version);
        ok(os.tablet);
    });

    module('BlackBerry');
    test('BLACKBERRY_6_0_0_141', function() {
        var o = detect(UA.BLACKBERRY_6_0_0_141);
        var os = o.os;
        var browser = o.browser;
        ok(os.blackberry);
        ok(browser.webkit);
        equal('6.0.0.141', os.version);
    });
    test('PLAYBOOK_1_0_0', function() {
        var o = detect(UA.PLAYBOOK_1_0_0);
        var os = o.os;
        var browser = o.browser;
        ok(os.rimtabletos);
        ok(browser.webkit);
        ok(os.tablet);
        equal('1.0.0', os.version);
    });
    test('PLAYBOOK_2_1_0', function() {
        var o = detect(UA.PLAYBOOK_2_1_0);
        var os = o.os;
        var browser = o.browser;
        ok(os.rimtabletos);
        ok(browser.webkit);
        ok(os.tablet);
        equal('2.1.0', os.version);
    });
    test('BB10', function() {
        var o = detect(UA.BB10);
        var os = o.os;
        var browser = o.browser;
        ok(os.bb10);
        ok(browser.webkit);
        ok(os.phone);
        equal('10.0.0.1337', os.version);
    });

    module('kindle');
    test('KINDLE', function() {
        var o = detect(UA.KINDLE);
        var os = o.os;
        var browser = o.browser;
        ok(os.kindle);
        ok(browser.webkit);
        equal('3.0', os.version);
    });
    test('SILK_1_0', function() {
        var o = detect(UA.SILK_1_0);
        var os = o.os;
        var browser = o.browser;
        ok(os.android);
        ok(browser.silk);
        equal('2.3.4', os.version);
    });
    test('SILK_1_0_ACCEL', function() {
        var o = detect(UA.SILK_1_0_ACCEL);
        var os = o.os;
        var browser = o.browser;
        ok(!os.android);
        ok(browser.webkit);
        ok(browser.silk);
        equal('1.0.13.328_10008910', browser.version);
    });

    module('firefox');
    test('FIREFOX_6_0_2', function() {
        var o = detect(UA.FIREFOX_6_0_2);
        var browser = o.browser;
        ok(!browser.webkit);
        ok(browser.firefox);
        equal('6.0.2', browser.version);
    });
    test('FIREFOX_13_TABLET', function() {
        var o = detect(UA.FIREFOX_13_TABLET);
        var os = o.os;
        var browser = o.browser;
        ok(!browser.webkit);
        ok(browser.firefox);
        ok(os.tablet);
        ok(!os.phone);
    });
    test('FIREFOX_13_PHONE', function() {
        var o = detect(UA.FIREFOX_13_PHONE);
        var os = o.os;
        var browser = o.browser;
        ok(!browser.webkit);
        ok(browser.firefox);
        ok(!os.tablet);
        ok(os.phone);
    });

    module('opera');
    test('OPERA_11_51', function() {
        var o = detect(UA.OPERA_11_51);
        var browser = o.browser;
        ok(!browser.webkit);
        ok(o.isUndefined(browser.version));
    });

    module('chrome');
    test('CHROME_ANDROID_18_0', function() {
        var o = detect(UA.CHROME_ANDROID_18_0);
        var os = o.os;
        var browser = o.browser;
        ok(os.android);
        ok(browser.webkit);
        ok(browser.chrome);
        ok(os.phone);
        ok(!os.tablet);
        equal('18.0.1025.133', browser.version);
    });
    test('CHROME_IOS_19_0', function() {
        var o = detect(UA.CHROME_IOS_19_0);
        var os = o.os;
        var browser = o.browser;
        ok(os.ios);
        ok(browser.webkit);
        ok(browser.chrome);
        ok(os.phone);
        ok(!os.tablet);
        equal('19.0.1084.60', browser.version);
    });
    test('CHROME_OSX_24_0', function() {
        var o = detect(UA.CHROME_OSX_24_0);
        var os = o.os;
        var browser = o.browser;
        ok(browser.chrome);
        ok(!os.phone);
        ok(!os.tablet);
    });
});