# sis-bo-tools（本番用）

先方（drug store's）にお渡ししているツールです。ブックマークは1つだけで、押した画面に合わせてメニューを出します。

- メルカートBO：在庫更新／バナー反映／メルマガ
- Liny：LINE配信（ツールが1つだけなので、メニューを出さずにすぐ起動）

新しいツールや直したツールは、まずテスト用（qoo-ai/sis-bo-tools-test）で試します。固まったら、同じファイルと `sis.js` の1行をこちらへ移します。

## ブックマーク

```
javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/qoo-ai/sis-bo-tools@main/sis.js?t='+Date.now();s.charset='utf-8';document.body.appendChild(s);})();
```

## ツールを止める

- 全部止める（契約終了など）：`sis.js` の `ENABLED` を `false` にする
- 1つだけ止める：`sis.js` の `TOOLS` で、そのツールの `on` を `false` にする

## ツールを足す・直す

1. `tools/<id>.js` をコミットする（`javascript:` を外した素のJSで置く）
2. 1のコミットIDを、`sis.js` の `TOOLS` にあるそのツールの `sha` に書く（足す場合は1行追加）
3. `sis.js` をコミットする
4. `https://purge.jsdelivr.net/gh/qoo-ai/sis-bo-tools@main/sis.js` を開いて、キャッシュを消す

ツール本体はコミットIDで読み込むので、ツール側のキャッシュを消す必要はありません。
