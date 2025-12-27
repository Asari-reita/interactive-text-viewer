<template>
  <main class="legal">
    <header class="legal__header">
      <h1 class="legal__title">利用規約</h1>
      <p class="legal__meta">最終更新日：2025-12-13</p>
    </header>

    <!-- ※ preだとコピペは楽。見た目も崩れない -->
    <section class="legal__body">
      <pre class="legal__text">{{ terms }}</pre>
    </section>
  </main>
</template>

<script setup>
// 利用規約本文：ここはそのまま編集してOK
const terms = `利用規約

この利用規約（以下「本規約」）は、本サービス運営者（以下「運営者」）が提供する本サービス（以下「本サービス」）の利用条件を定めるものです。
利用者は、本サービスを利用した時点で、本規約に同意したものとみなします。

第1条（サービス内容）
本サービスは、利用者が選択した文章に対して、AIを用いた意味・解説等の情報を表示する学習支援ツールです。

第2条（情報の正確性について）
本サービスで提供される解説・説明は、正確性・完全性・最新性を保証するものではありません。
学習・参考目的での利用に限られ、公式な見解や専門的判断の代替とはなりません。

第3条（禁止事項）
利用者は、以下の行為を行ってはなりません。
・法令または公序良俗に違反する行為
・本サービスの不正利用、過度な連続アクセス
・第三者または運営者に損害を与える行為

第4条（免責事項）
運営者は、本サービスの利用により生じたいかなる損害についても、一切の責任を負いません。
また、AIの応答内容に起因する結果についても同様とします。

第5条（サービスの変更・停止）
運営者は、利用者への事前通知なく、本サービスの内容変更または提供停止を行うことがあります。

第6条（規約の変更）
運営者は、必要に応じて本規約を変更することがあります。
変更後の規約は、本サービス上に掲載された時点で効力を有します。

以上`;
</script>

<style scoped>
/* 規約ページの最低限スタイル（既存テーマに馴染むように無難に） */
.legal { max-width: 920px; margin: 0 auto; padding: 24px 16px; }
.legal__header { margin-bottom: 16px; }
.legal__title { font-size: 22px; margin: 0 0 6px; }
.legal__meta { margin: 0; font-size: 12px; opacity: 0.7; }
.legal__body { border: 1px solid var(--border, #e5e7eb); background: var(--bg-2, #fff); border-radius: 12px; padding: 16px; }
.legal__text { white-space: pre-wrap; line-height: 1.85; font-size: 14px; margin: 0; }
</style>
