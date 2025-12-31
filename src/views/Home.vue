<template>
  <!-- 背景ブロブ（CSSで曲線のにじみ） -->
  <div class="bg-blob"></div>
  <div class="bg-blob-2"></div>

  <main class="container">
    <!-- タイトル：白、ボックスなし -->
    <h1 class="title">Interactive Text Viewer</h1>
    <p class="site-description">
  ドキュメントを開いて、気になる言葉を選択するだけ。知識がその場で広がる、あなた専用の知識ビューア。
</p>
<section style="margin-top: 28px;">
  <h2>このサイトでできること {{ Date.now() }}</h2>

  <ul>
    <li>文章中の気になる言葉をドラッグするだけで意味を確認できます</li>
    <li>Wikipedia・辞書・AIを組み合わせて多角的に理解できます</li>
    <li>論文・レポート・記事の読解をサポートする学習支援ツールです</li>
  </ul>

  <p style="margin-top: 14px;">
    本サービスは学習・理解の補助を目的としており、表示される解説の正確性や完全性を保証するものではありません。
  </p>
  <p style="font-size: 0.9rem; color: var(--ink-muted);">
  本サイトはAIおよび外部情報源を利用して解説を提供しています。
</p>
</section>

    <!-- 大きな濃紺カード（中にUIを配置） -->
    <section class="shell">
      <!--<span class="pill">オプション</span>-->  <!-- 任意：スクショの丸いタブ風 -->
      <InteractiveText />
    </section>
   


  </main>
</template>

<script setup>
import InteractiveText from '../components/InteractiveText.vue'
</script>

<style scoped>
/* 追加のローカル調整があればここに */
.context-ad {
  margin-top: 20px;
  padding: 10px;
  border: 1px dashed rgba(255,255,255,0.4);
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
  opacity: 0.85;
}

</style>
