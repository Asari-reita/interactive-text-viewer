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
