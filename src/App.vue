<template>
  <!-- ルーティング先のページを表示 -->
  <RouterView />

  <!-- 全ページ共通：フッター直前広告 -->
  <div class="global-ad">
    <span class="ad-label">Advertisement</span>
  </div>

  <!-- 規約・プライバシー・お問い合わせリンク用フッター -->
  <AppFooter />
</template>

<script setup>
// RouterView / RouterLink は vue-router が入ってれば自動で使える（import不要）
import AppFooter from "./components/AppFooter.vue";
</script>

<style scoped>
/* App.vue は共通枠だけにするので、基本ここは空でOK */
/* App.vue に追記 or グローバルCSS */
.global-ad {
  margin: 32px auto 12px;
  max-width: 960px;
  padding: 12px;
  border: 1px dashed rgba(255,255,255,0.35);
  text-align: center;
  border-radius: 10px;
  font-size: 12px;
  opacity: 0.8;
}

</style>
