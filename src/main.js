// Vueアプリのエントリポイント
import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"; 
// ✅ テーマ用グローバルCSSを読み込み
import './style.css'

const app = createApp(App);

// 先にプラグイン（router）を登録してから…
app.use(router);

// 最後に mount
app.mount("#app");


