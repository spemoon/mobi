define("dist/app/version/about/index",["../helper"],function(n,e,t){var i=n("../helper");t.exports=function(n){var e=n.r.$;e("#box").html(i.tail("my name is Tom hoo"))}}),define("dist/app/version/helper",[],function(n,e,t){var i={tail:function(n){return n+":"+new Date},head:function(n){return new Date+":"+n}};t.exports=i});