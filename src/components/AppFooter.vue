<template>
  <footer class="footer">
    <nav class="footer__links">
      <RouterLink to="/terms">利用規約</RouterLink>
      <span class="footer__sep">・</span>
      <RouterLink to="/privacy">プライバシーポリシー</RouterLink>
      <span class="footer__sep">・</span>
      <!-- お問い合わせは後で用意してもOK（ひとまず外部フォームでも可） -->
      <a :href="contactUrl" target="_blank" rel="noopener">お問い合わせ</a>
    </nav>
  </footer>
</template>

<script setup>
// TODO: ここを自分のフォームURLに変更（Googleフォーム等でOK）
const contactUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfBwfv65zZ12Dvfrbmf_q-rwUaaSSp4LBMHyJ6GM2A6gBU3dw/viewform?usp=header";
</script>

<style scoped>
.footer { padding: 18px 12px; text-align: center; font-size: 13px; opacity: 0.85; }
.footer__links a { text-decoration: none; }
.footer__sep { margin: 0 6px; opacity: 0.6; }
</style>
