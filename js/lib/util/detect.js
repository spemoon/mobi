/**
 * User: caolvchong@gmail.com
 * Date: 5/3/13
 * Time: 11:56 AM
 */
define(function(require, exports, module) {
    var $ = require('./core');

    var detect = function(ua) {
        var os = this.os = {};
        var browser = this.browser = {};
        var webkit = ua.match(/WebKit\/([\d.]+)/);
        var android = ua.match(/(Android)\s+([\d.]+)/);
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
        var webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/);
        var touchpad = webos && ua.match(/TouchPad/);
        var kindle = ua.match(/Kindle\/([\d.]+)/);
        var silk = ua.match(/Silk\/([\d._]+)/);
        var blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/);
        var bb10 = ua.match(/(BB10).*Version\/([\d.]+)/);
        var rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/);
        var playbook = ua.match(/PlayBook/);
        var chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/);
        var firefox = ua.match(/Firefox\/([\d.]+)/);

        if(browser.webkit = !!webkit) {
            browser.version = webkit[1];
        }

        if(android) {
            os.android = true;
            os.version = android[2];
        }
        if(iphone) {
            os.ios = os.iphone = true;
            os.version = iphone[2].replace(/_/g, '.');
        }
        if(ipad) {
            os.ios = os.ipad = true;
            os.version = ipad[2].replace(/_/g, '.');
        }
        if(webos) {
            os.webos = true;
            os.version = webos[2];
        }
        if(touchpad) {
            os.touchpad = true;
        }
        if(blackberry) {
            os.blackberry = true;
            os.version = blackberry[2];
        }
        if(bb10) {
            os.bb10 = true;
            os.version = bb10[2];
        }
        if(rimtabletos) {
            os.rimtabletos = true;
            os.version = rimtabletos[2];
        }
        if(kindle) {
            os.kindle = true;
            os.version = kindle[1];
        }

        if(playbook) {
            browser.playbook = true;
        } else if(silk) {
            browser.silk = true;
            browser.version = silk[1];
        } else if(!silk && os.android && ua.match(/Kindle Fire/)) {
            browser.silk = true;
        }

        if(chrome) {
            browser.chrome = true;
            browser.version = chrome[1];
        } else if(firefox) {
            browser.firefox = true;
            browser.version = firefox[1];
        }

        os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) || (firefox && ua.match(/Tablet/)));
        os.phone = !!(!os.tablet && (android || iphone || webos || blackberry || bb10 || (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) || (firefox && ua.match(/Mobile/))));

        return this;
    };

    detect.call($, navigator.userAgent); // 给$绑上 os和browser两个属性

    $.detect = detect;

    return function(ua) {
        return detect.call($, ua);
    };
});