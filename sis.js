/* SIS BO tools loader target v1.0
   ENABLED=false にすると、このブックマークは何もせず「利用終了」を表示して止まる
   ツールを更新したら stock.js をコミット → そのコミットIDを STOCK に書く → sis.js だけ jsDelivr で purge（stock.js はコミット固定なので即反映） */
(function(){
var ENABLED=true;
var VERSION='1.4';
var STOCK='https://cdn.jsdelivr.net/gh/qoo-ai/sis-bo-tools@79977a92296f23e4dfa75988ba3de8b0a1f2a14f/stock.js';
function bar(msg,bg){var d=document.createElement('div');d.textContent=msg;d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:2147483647;padding:12px;background:'+(bg||'#344054')+';color:#fff;font:15px/1.5 sans-serif;text-align:center';document.body.appendChild(d);setTimeout(function(){d.remove();},8000);}
if(!ENABLED){bar('このツールの提供は終了しました。','#667085');return;}
if(!/\/(opipwy|doecms)\//.test(location.pathname)&&!/office\./.test(location.hostname)){bar('BO（管理画面）を開いた状態で押してください。','#b42318');return;}
var s=document.createElement('script');s.src=STOCK;s.charset='utf-8';s.onerror=function(){bar('ツールを読み込めませんでした。時間をおいてもう一度押してください。','#b42318');};document.body.appendChild(s);
})();
