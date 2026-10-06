(function(){
/* SIS BO tools: stock import helper v1.3 (2026-10-06). Copies '商品コード/在庫数' rows from the clipboard into the BO product import (stock). The final [取込] button is always pressed by a person. */
var W=window,D=document,ROOT=location.origin+'/'+location.pathname.split('/')[1]+'/';
var URL1=ROOT+'import/imp_goods.aspx';
function el(t,css,txt){var e=D.createElement(t);if(css)e.style.cssText=css;if(txt)e.textContent=txt;return e;}
var old=D.getElementById('dsStock');if(old)old.remove();
var box=el('div','position:fixed;inset:0;z-index:2147483000;background:#fff;display:flex;flex-direction:column');box.id='dsStock';
var bar=el('div','display:flex;gap:12px;align-items:center;padding:8px 12px;font:14px/1.5 sans-serif;color:#fff;background:#344054');
var st=el('div','flex:1');var x=el('button','padding:4px 12px','閉じる');x.onclick=function(){box.remove();};
bar.appendChild(st);bar.appendChild(x);box.appendChild(bar);D.body.appendChild(box);
function say(a,b,kind){st.textContent='';var p=el('div','font-size:16px;font-weight:bold',a);st.appendChild(p);if(b)st.appendChild(el('div','font-size:13px;opacity:.9',b));
 bar.style.background=kind=='ng'?'#b42318':kind=='ok'?'#1a7f37':kind=='go'?'#b54708':'#344054';}
function parse(t){
 t=(t||'').replace(/\r/g,'').trim();
 if(!t)throw new Error('コピーした内容が空です');
 if(/チェックがNG/.test(t))throw new Error('在庫更新シートの判定がNGです。「チェック」タブを直してからコピーしてください');
 var lines=t.split('\n').filter(function(s){return s.trim()!=='';});
 var sep=lines[0].indexOf('\t')>=0?'\t':',';
 var head=lines[0].split(sep).map(function(s){return s.replace(/"/g,'').trim();});
 if(head[0]!=='商品コード'||head[1]!=='在庫数')throw new Error('在庫更新シートの「取込用」タブの内容ではありません（1行目が「商品コード」「在庫数」になっていません）');
 var rows=[],seen={};
 for(var i=1;i<lines.length;i++){
  var c=lines[i].split(sep).map(function(s){return s.replace(/"/g,'').trim();});
  if(!c[0])continue;
  if(!/^[0-9]+(-[0-9]+){3}$/.test(c[0]))throw new Error((i+1)+'行目の商品コードの形が違います：'+c[0]);
  if(!/^[0-9]+$/.test(c[1]||''))throw new Error((i+1)+'行目の在庫数が数字ではありません：'+c[0]+' → '+(c[1]||'空欄'));
  if(seen[c[0]])throw new Error('同じ商品コードが2回あります：'+c[0]);
  seen[c[0]]=1;rows.push([c[0],c[1]]);
 }
 if(!rows.length)throw new Error('取り込む行がありません');
 return rows;}
function ask(){
 var p=el('div','margin:40px auto;width:560px;max-width:92vw;font:14px sans-serif');
 p.appendChild(el('b',null,'在庫更新シートの「取込用」タブをコピーしてから、ここに貼り付け（Ctrl+V）'));
 var ta=el('textarea','display:block;width:100%;height:160px;margin:10px 0;font:12px monospace');ta.id='dsStockTa';
 var go=el('button','padding:8px 18px','流し込む');go.id='dsStockGo';
 p.appendChild(ta);p.appendChild(go);box.appendChild(p);ta.focus();
 go.onclick=function(){try{var r=parse(ta.value);p.remove();run(r);}catch(e){say('⛔ '+e.message,'取込はまだされていません。シートを直してもう一度コピーし、貼り直してください','ng');}};}
function csvp(t){var out=[],row=[],f='',q=false;for(var i=0;i<t.length;i++){var ch=t[i];
 if(q){if(ch=='"'){if(t[i+1]=='"'){f+='"';i++;}else q=false;}else f+=ch;}
 else if(ch=='"')q=true;else if(ch==','){row.push(f);f='';}else if(ch=='\n'){row.push(f.replace(/\r$/,''));out.push(row);row=[];f='';}else f+=ch;}
 if(f||row.length){row.push(f);out.push(row);}return out;}
function pd(v){var m=String(v||'').match(/(\d{4})\D(\d{1,2})\D(\d{1,2})(?:\D+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);return m?new Date(+m[1],m[2]-1,+m[3],+(m[4]||0),+(m[5]||0),+(m[6]||0)):null;}
function master(){
 return fetch(ROOT+'import/exp_goods.aspx',{credentials:'same-origin'}).then(function(r){return r.text();}).then(function(t){
  var g=new DOMParser().parseFromString(t,'text/html'),fm=g.querySelector('form');if(!fm)throw 0;var fd=new URLSearchParams();
  [].slice.call(fm.querySelectorAll('input,select')).forEach(function(i){if(!i.name||/submit|button|image/.test(i.type))return;if((i.type=='radio'||i.type=='checkbox')&&!i.checked)return;fd.append(i.name,i.value);});
  fd.set('table','tmpgoodscustom2');fd.set('format','CSV');fd.set('header','1');fd.append('export.x','10');fd.append('export.y','5');
  return fetch(ROOT+'import/exp_goods.aspx',{method:'POST',body:fd,credentials:'same-origin'});
 }).then(function(r){if(!/csv/.test(r.headers.get('content-type')||''))throw 0;return r.arrayBuffer();}).then(function(b){
  var t=new TextDecoder('utf-8').decode(b);if(t.indexOf('\ufffd')>=0)t=new TextDecoder('shift_jis').decode(b);
  return toMaster(csvp(t));});}
function toMaster(a){
  var h=a[0],ic=h.indexOf('商品コード'),iq=h.indexOf('在庫数'),is=-1,inm=h.indexOf('商品名'),ib=h.indexOf('掲載開始日'),ie=h.indexOf('掲載終了日');
  h.forEach(function(x,k){if(is<0&&/^状態/.test(x))is=k;});if(ic<0||iq<0||is<0)throw 0;
  var m={};for(var k=1;k<a.length;k++){var r=a[k];if(r[ic])m[r[ic]]={q:r[iq],s:r[is],n:inm>=0?r[inm]:'',b:ib>=0?r[ib]:'',e:ie>=0?r[ie]:''};}return m;}
var SNAME={'1':'非表示','2':'下書き','3':'価格エラー','9':'終息'};
function classify(all,m,now){
  var o={rows:[],un:[],pre:[],end:[],hid:[],miss:[],chg:0},inr={};
  all.forEach(function(r){inr[r[0]]=1;var c=m[r[0]];if(!c){o.un.push([r[0],r[1]]);return;}
   o.rows.push(r);if(String(c.q)!==String(r[1]))o.chg++;
   var b=pd(c.b),e=pd(c.e),it=[r[0],c.q,r[1],c];
   if(String(c.s)!=='0')o.hid.push(it);else if(b&&b>now)o.pre.push(it);else if(e&&e<now)o.end.push(it);});
  Object.keys(m).forEach(function(k){var c=m[k];if(inr[k]||String(c.s)!=='0'||!(parseInt(c.q,10)>0))return;var b=pd(c.b),e=pd(c.e);if((b&&b>now)||(e&&e<now))return;o.miss.push([k,c.q,c]);});
  return o;}
function listText(o){
  function L(t,a,f){return '■ '+t+' '+a.length+'件\n'+(a.length?a.map(f).join('\n'):'なし');}
  function nm(c){return String(c.n||'');}
  return [
   L('シートにあるのにWebに無いコード（取り込みません）',o.un,function(x){return x[0]+'\tシートの在庫数 '+x[1];}),
   L('シートにあるが発売前（掲載開始日がまだ先。在庫は取り込みます）',o.pre,function(x){return x[0]+'\t'+x[1]+' → '+x[2]+'\t掲載開始 '+x[3].b+'\t'+nm(x[3]);}),
   L('シートにあるが掲載終了済み（在庫は取り込みますが、サイトには出ません）',o.end,function(x){return x[0]+'\t'+x[1]+' → '+x[2]+'\t掲載終了 '+x[3].e+'\t'+nm(x[3]);}),
   L('シートにあるが状態が通常以外（サイトには出ません）',o.hid,function(x){return x[0]+'\t'+x[1]+' → '+x[2]+'\t状態 '+x[3].s+'（'+(SNAME[x[3].s]||'不明')+'）\t'+nm(x[3]);}),
   L('シートに無いのにWebで販売中（状態0・掲載期間内・在庫1以上。在庫は今のまま）',o.miss,function(x){return x[0]+'\t今の在庫 '+x[1]+'\t'+nm(x[2]);})
  ].join('\n\n');}
function run(all){
 say('メルカートの商品一覧と照らし合わせています…（'+all.length+'件）');
 master().then(function(m){
  var o=classify(all,m,new Date()),rows=o.rows;
  if(!rows.length){say('⛔ メルカートにある商品コードが1つもありません','シートの「取込用」をコピーし直してください。わからなければSISへ','ng');return;}
  var pnl=el('div','display:none;max-height:45vh;overflow:auto;padding:8px 12px;font:12px/1.6 monospace;background:#fff8e6;border-bottom:1px solid #f0c36d;white-space:pre');
  pnl.textContent=listText(o);
  var tg=el('button','padding:4px 12px','一覧');tg.onclick=function(){pnl.style.display=pnl.style.display=='none'?'block':'none';};
  var cp=el('button','padding:4px 12px','一覧をコピー');cp.onclick=function(){try{navigator.clipboard.writeText(pnl.textContent);cp.textContent='コピーしました';}catch(e){}};
  bar.insertBefore(cp,x);bar.insertBefore(tg,cp);box.insertBefore(pnl,bar.nextSibling);
  go(rows,'（在庫が変わる '+o.chg+'件／Webに無い '+o.un.length+'件は飛ばします／発売前 '+o.pre.length+'・掲載終了 '+o.end.length+'・状態が通常以外 '+o.hid.length+'件／シートに無いのに販売中 '+o.miss.length+'件　中身は［一覧］）');
 },function(){go(all,'（※メルカートの商品一覧を読めなかったので、Webとの照合はしていません）');});}
function go(rows,note){
 say('商品インポートの画面を開いています…（'+rows.length+'件）');
 var f=el('iframe','flex:1;border:0;width:100%');box.appendChild(f);var stage=0;
 f.onload=function(){var g,w;try{g=f.contentDocument;w=f.contentWindow;if(!g||!g.body)throw 0;}catch(e){say('BOの画面を読み込めません（ログイン切れの可能性）','BOにログインし直して、もう一度ブックマークを押してください','ng');return;}
  try{
   if(g.querySelector('input[type=password]'))throw new Error('ログイン画面です。BOにログインしてから押してください');
   var txt=g.body.innerText||'';
   if(stage==1&&/受付しました/.test(txt)){
    var m=txt.match(/総件数\s*([0-9,]+)\s*件/);var n=m?parseInt(m[1].replace(/,/g,''),10):null;
    if(n===rows.length)say('✅ 受付されました（'+n+'件）','数分後に下の「処理状況ログ」で［更新］を押し、success になっていることを確かめてください。終わったら［閉じる］','ok');
    else say('⚠ 受付件数が合いません（受付 '+n+'件／シート '+rows.length+'件）','処理状況ログと在庫検索を確かめてください。わからなければSISへ','ng');
    stage=2;setTimeout(function(){f.src=URL1;},1500);return;}  /* 受付後はまっさらな画面に入れ替え（再読み込みで二重取込しないため） */
   var stock=g.querySelector('input[type=radio][value=tmpgoodsstock]');var file=g.querySelector('input[type=file]');
   if(!stock||!file){if(stage==0){stage=-1;f.src=URL1;return;}throw new Error('商品インポートの画面を開けませんでした（'+g.title+'）');}
   if(stage==2)return;
   stock.click();
   var radios=[].slice.call(g.querySelectorAll('input[type=radio]'));
   var hd=radios.filter(function(r){return r.value==='1'&&r.name!==stock.name;})[0];
   var cv=radios.filter(function(r){return r.value==='CSV';})[0];
   if(!hd||!cv)throw new Error('「列見出し 有り」「CSV形式」の選択肢が見つかりません');
   hd.click();cv.click();
   var csv='商品コード,在庫数\r\n'+rows.map(function(r){return r[0]+','+r[1];}).join('\r\n')+'\r\n';
   var d=new Date(),pad=function(n){return ('0'+n).slice(-2);};
   var name='在庫更新_'+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'_'+pad(d.getHours())+pad(d.getMinutes())+'.csv';
   var dt=new w.DataTransfer();dt.items.add(new w.File([csv],name,{type:'text/csv'}));file.files=dt.files;
   var chk=[].slice.call(g.querySelectorAll('input[type=radio]:checked')).map(function(r){return r.value;});
   if(chk.indexOf('tmpgoodsstock')<0)throw new Error('インポート先「商品在庫」を選べませんでした');
   if(!hd.checked||!cv.checked)throw new Error('「列見出し 有り」「CSV形式」を選べませんでした');
   if(!file.files.length)throw new Error('ファイルを入れられませんでした');
   var btn=[].slice.call(g.querySelectorAll('input[type=submit],button')).filter(function(b){return (b.value||b.textContent).trim()==='取込';})[0];
   if(btn){btn.style.outline='4px solid #f79009';btn.style.outlineOffset='4px';btn.scrollIntoView({block:'center'});}
   stage=1;
   say('👉 準備できました。赤い［取込］を押してください（取込 '+rows.length+'件）',note+'　押すまで取込はされません。やめるときは［閉じる］','go');
  }catch(e){say('⛔ '+e.message,'取込はまだされていません','ng');}
 };
 f.src=URL1;}
try{
 if(navigator.clipboard&&navigator.clipboard.readText){
  navigator.clipboard.readText().then(function(t){try{run(parse(t));}catch(e){ask();}},function(){ask();});
 }else ask();
}catch(e){ask();}
})();
