<template>
  <main class="legal">
    <header class="legal__header">
      <h1 class="legal__title">プライバシーポリシー</h1>
      <p class="legal__meta">最終更新日：2025-12-13</p>
    </header>

    <section class="legal__body">
      <pre class="legal__text">{{ policy }}</pre>
    </section>
  </main>
</template>

<script setup>
// AdSense対応を意識した最低限の記述
const policy = `プライバシーポリシー

本サービスでは、利用者のプライバシーを尊重し、以下の方針に基づいて情報を取り扱います。

1. 取得する情報について
本サービスでは、氏名・メールアドレス等の個人を特定できる情報の入力は求めていません。
ただし、以下の情報が自動的に取得される場合があります。
・IPアドレス
・ブラウザ情報、端末情報
・アクセス日時、閲覧ページ

2. 広告について
本サービスでは、第三者配信の広告サービス（Google AdSense）を利用する予定です。
広告配信事業者は、利用者の興味に応じた広告を表示するため、Cookieを使用することがあります。
Googleによる広告におけるCookieの使用については、以下をご確認ください。
https://policies.google.com/technologies/ads

3. アクセス解析について
本サービスでは、サービス改善のためアクセス解析ツールを利用する場合があります。
これにより収集される情報は匿名であり、個人を特定するものではありません。

4. 取得した情報の利用目的
取得した情報は、以下の目的で利用します。
・サービスの提供・改善
・不正利用の防止
・利用状況の分析

5. 第三者提供について
法令に基づく場合を除き、取得した情報を第三者に提供することはありません。

6. プライバシーポリシーの変更
本ポリシーは、必要に応じて変更されることがあります。

以上`;
</script>

<style scoped>
/* Terms.vueと揃える（コピペでOK） */
.legal { max-width: 920px; margin: 0 auto; padding: 24px 16px; }
.legal__header { margin-bottom: 16px; }
.legal__title { font-size: 22px; margin: 0 0 6px; }
.legal__meta { margin: 0; font-size: 12px; opacity: 0.7; }
.legal__body { border: 1px solid var(--border, #e5e7eb); background: var(--bg-2, #fff); border-radius: 12px; padding: 16px; }
.legal__text { white-space: pre-wrap; line-height: 1.85; font-size: 14px; margin: 0; }
</style>
