define("dist/app/version/index",["$"],function(e){var n=e("$"),i={home:{url:"dist/app/version/home/index",version:"0.0.2"},user:{url:"dist/app/version/user/index",version:"0.0.1"},about:{url:"dist/app/version/about/index",version:"0.0.1"}},t=function(e,t){var r=i[e];r&&seajs.xuse({url:r.url,version:r.version,callback:function(e){e(n.extend({r:{$:n}},t))}})};n(function(){n("#box"),n.history.listen({home:function(){t("home")},"user/:id":function(e){t("user",{p:{id:e}})},about:function(){t("about")},defaultRouter:"user/1"})})});