<template>
  
  <div class="layout" :class="themeClass">
    <!-- ===== 上：入力 ===== -->
    <section class="panel panel--white">
      <div class="label">ここに文章を入力または貼り付けてください</div>

      <textarea
        class="manual-input"
        placeholder="論文や本文をここに貼り付け"
        v-model="manualInput"
      ></textarea>

      <div class="controls">
        <button type="button" class="action-btn" @click="applyManualInput">
          表示する
        </button>
        <button type="button" class="action-btn action-btn--ghost" @click="clearAll">
          クリア
        </button>
        <span class="hint" v-if="savedHint">{{ savedHint }}</span>
      </div>
    </section>

    <!-- ===== 中：読みやすさ調整 ===== -->
    <section class="panel">
      <div class="label">表示設定（読みやすさ）</div>

      <div class="row">
        <div class="row-label">文字サイズ</div>
        <input type="range" min="14" max="26" step="1" v-model.number="fontSize" />
        <div class="row-val">{{ fontSize }}px</div>
      </div>

      <div class="row">
        <div class="row-label">行間</div>
        <input type="range" min="1.4" max="2.4" step="0.1" v-model.number="lineHeight" />
        <div class="row-val">{{ lineHeight.toFixed(1) }}</div>
      </div>

      <div class="row">
        <div class="row-label">本文幅</div>
        <input type="range"min="320":max="maxContentWidth"step="20"v-model.number="contentWidth"/>
<div class="row-val">{{ contentWidth }}px</div>
      </div>

      <!-- 表示モード：改行維持 / 横幅いっぱい -->
      <div class="controls" style="margin-top:10px;">
        <label class="engine-opt">
          <input type="radio" value="keep" v-model="wrapMode" />
          改行そのまま
        </label>
        <label class="engine-opt">
          <input type="radio" value="wrap" v-model="wrapMode" />
          横幅いっぱいに回り込み
        </label>
      </div>

      <!-- テーマ：ライト / ダーク -->
      <div class="controls" style="margin-top:10px;">
        <label class="engine-opt">
          <input type="radio" value="light" v-model="theme" />
          ライト
        </label>
        <label class="engine-opt">
          <input type="radio" value="dark" v-model="theme" />
          ダーク
        </label>
      </div>
    </section>

    <!-- ===== 下：本文（選択で解説） ===== -->
    <section
  class="panel text-container"
  :style="readerStyle"
  @mouseup="handleSelection"
  @touchend="handleSelection(true)"
>

      <div class="label" style="margin-bottom:8px;">本文（ドラッグ選択で解説）</div>

      <div class="reader" :class="wrapModeClass">
        <!-- 改行そのまま（pre-wrapで表示） -->
        <pre v-if="wrapMode === 'keep'" class="raw-pre">{{ rawText }}</pre>

        <!-- 横幅いっぱいに回り込み（空行だけ段落化） -->
        <template v-else>
          <p v-for="(p, i) in wrapParagraphs" :key="i">{{ p }}</p>
        </template>

        <p v-if="!rawText.trim()" class="empty">ここに本文が表示されます。</p>
      </div>
    </section>

    <!-- ===== 画面下固定：解説 + 広告（縦積み） ===== -->
<div v-if="definition" class="fixed-stack">
  <!-- 解説 -->
  <div class="definition-box fixed-definition">
    <strong class="def-word">{{ selectedWord }}</strong>
    <span class="def-text">{{ truncatedDefinition }}</span>

    <span class="source" v-if="resultSource">
      出典: {{ resultSource }}
      <a v-if="resultLink" :href="resultLink" target="_blank" rel="noopener noreferrer">開く</a>
    </span>

    <div class="def-controls">
      <label class="engine-label">解説:</label>

      <label class="engine-opt">
        <input type="radio" value="wiki" v-model="explainEngine" />
        Wikipedia
      </label>
      <label class="engine-opt">
        <input type="radio" value="dict" v-model="explainEngine" />
        辞書
      </label>
      <label class="engine-opt">
        <input type="radio" value="gpt" v-model="explainEngine" />
        ChatGPT
      </label>

      <button class="action-btn" @click="reExplain" :disabled="!selectedWord || isLoading">
  {{ isLoading ? '読み込み中…' : '再解説' }}
</button>
      <button class="action-btn action-btn--ghost" @click="closeExplain">
        閉じる
      </button>
    </div>

    <div v-if="selectionError" class="error">
      {{ selectionError }}
    </div>
  </div>



  <!-- 広告（解説バナーの直下） 
  <div class="context-ad">
    <span class="ad-label">Advertisement</span>
  </div> -->
</div>

<!-- fixed stack の分だけ下に余白 -->
<div class="definition-spacer" v-if="definition"></div>

    </div>

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

/**
 * ===== MVP方針 =====
 * - 入力はコピペのみ
 * - 読みやすさ設定（文字サイズ/行間/本文幅/テーマ/折返し）
 * - 選択した語句を Wikipedia / 辞書 / ChatGPT で解説
 *   - Wikipedia選択時: Wiki → 辞書(Free→JLPT) → GPT
 *   - 辞書選択時: Free → JLPT → GPT
 *   - ChatGPT選択時: GPTのみ
 * - ローカル保存（最後の入力 + 表示設定）
 */

/* ===== 入力・表示 ===== */
const manualInput = ref('')
const rawText = ref('') // 表示用（表示するボタンで反映）

/* ===== 読みやすさ設定 ===== */
const fontSize = ref(18)
const lineHeight = ref(1.9)
const contentWidth = ref(760)
const maxContentWidth = computed(() => Math.min(920, Math.max(320, viewportW.value - 80)))


// ===== レスポンシブ：スマホでは本文幅を画面に合わせる =====
const viewportW = ref(window.innerWidth)

function onResize() {
  viewportW.value = window.innerWidth
  clampContentWidth()
}

function clampContentWidth() {
  // パネル内の左右paddingぶんをざっくり引いて安全に
  const max = Math.min(920, Math.max(320, viewportW.value - 80))
  if (contentWidth.value > max) contentWidth.value = max
}

onMounted(() => {
  window.addEventListener("resize", onResize, { passive: true })
  clampContentWidth()
})

/* すでに onMounted を使ってるので、既存の onMounted に統合してOK
   例：restore() の後に clampContentWidth() を呼ぶ
*/


/* テーマ */
const theme = ref('light') // 'light' | 'dark'
const themeClass = computed(() => (theme.value === 'dark' ? 'theme-dark' : 'theme-light'))

function applyBodyTheme() {
  document.body.classList.toggle("theme-dark", theme.value === "dark")
}


/* 表示モード：'keep' は改行維持、'wrap' は横幅回り込み */
const wrapMode = ref('wrap')
const wrapModeClass = computed(() =>
  wrapMode.value === 'keep' ? 'mode-keep' : 'mode-wrap'
)

/* ===== 解説 ===== */
const selectedWord = ref('')
const definition = ref('')
const explainEngine = ref('wiki') // 'wiki' | 'dict' | 'gpt'

/* 出典表示用 */
const resultSource = ref('') // "Wikipedia" | "辞書(FreeDictionary)" | "辞書(JLPT)" | "ChatGPT"
const resultLink = ref('')

/* 制限 */
const MAX_TEXT_LENGTH = 30
const MAX_DEF_LEN = 300
const selectionError = ref('')

const truncatedDefinition = computed(() =>
  definition.value.length > MAX_DEF_LEN
    ? definition.value.slice(0, MAX_DEF_LEN) + '...'
    : definition.value
)

/* リクエスト状態 */
const isLoading = ref(false)
const lastRequestAt = ref(0)
const lastTerm = ref('')
const COOLDOWN_MS = 2000
const SAME_TERM_GUARD_MS = 1500


/* 横幅いっぱいに回り込み表示用：空行2つ以上で段落分割、単一改行はスペース扱いにする */
const wrapParagraphs = computed(() => {
  const t = (rawText.value || '').replace(/\r\n/g, '\n').trim()
  if (!t) return []
  return t
    .split(/\n{2,}/)                  // 空行で段落
    .map(p => p.replace(/\n+/g, ' ')) // 段落内の改行はスペースに（横幅回り込み）
    .map(p => p.trim())
    .filter(Boolean)
})

/* CSS用 */
const readerStyle = computed(() => ({
  '--reader-font-size': `${fontSize.value}px`,
  '--reader-line-height': String(lineHeight.value),
  '--reader-width': `${contentWidth.value}px`,
}))

/* ===== ボタン操作 ===== */
const savedHint = ref('')

function applyManualInput() {
  rawText.value = manualInput.value || ''
  closeExplain()
  flashSavedHint('反映しました')
  persist()
}

function clearAll() {
  manualInput.value = ''
  rawText.value = ''
  closeExplain()
  flashSavedHint('クリアしました')
  persist()
}

function closeExplain() {
  selectedWord.value = ''
  definition.value = ''
  resultSource.value = ''
  resultLink.value = ''
  selectionError.value = ''
}

function reExplain() {
  if (!selectedWord.value) return
  if (isLoading.value) return
  explainAuto(selectedWord.value, explainEngine.value, { force: true })
}


/* ===== 選択 → 解説（入口） ===== */
async function handleSelection(fromTouch = false) {
  const run = async () => {
    const sel = window.getSelection()?.toString()?.trim() || ''
    if (!sel) return

    selectionError.value = ''
    if (sel.length > MAX_TEXT_LENGTH) {
      selectionError.value = `選択できる文字数は${MAX_TEXT_LENGTH}文字までです（現在 ${sel.length} 文字）`
      return
    }
        // ===== 連打・同一語ガード（ここから） =====
    const now = Date.now()

    // 連打クールダウン
    if (now - lastRequestAt.value < COOLDOWN_MS) {
      selectionError.value = '少し待ってからもう一度お試しください。'
      return
    }

    // 同じ語の連続抑制（誤タップ防止）
    if (sel === lastTerm.value && now - lastRequestAt.value < SAME_TERM_GUARD_MS) {
      return
    }

    // ガード通過 → 記録
    lastRequestAt.value = now
    lastTerm.value = sel
    // ===== 連打・同一語ガード（ここまで） =====


    selectedWord.value = sel
    await explainAuto(sel, explainEngine.value)
  }

  // スマホは selection の確定が遅れることがあるので1拍置く
  if (fromTouch) {
    setTimeout(() => { run() }, 0)
    return
  }

  await run()
}


/* ===== 自動フォールバックルータ ===== */
async function explainAuto(term, preferred, opts = {}) {
  if (isLoading.value) return

  isLoading.value = true
  selectionError.value = ''
  definition.value = '読み込み中…'
  resultSource.value = ''
  resultLink.value = ''

  try {
    // 1) ChatGPT 強制
    if (preferred === 'gpt') {
      const text = await explainWithChatGPT(term)
      definition.value = text || '説明を取得できませんでした。'
      resultSource.value = 'ChatGPT'
      persist()
      return
    }

    // 2) 辞書強制（Free → JLPT → GPT）
    if (preferred === 'dict') {
      const d = await explainWithDictChain(term)
      if (d) {
        definition.value = d.text
        resultSource.value = d.source
        resultLink.value = d.link || ''
        persist()
        return
      }

      const text = await explainWithChatGPT(term)
      definition.value = text || '説明を取得できませんでした。'
      resultSource.value = 'ChatGPT'
      persist()
      return
    }

    // 3) Wikipedia優先（Wiki → 辞書 → GPT）
    const w = await explainWithWikipedia(term)
    if (w) {
      definition.value = w.text
      resultSource.value = w.source
      resultLink.value = w.link || ''
      persist()
      return
    }

    const d = await explainWithDictChain(term)
    if (d) {
      definition.value = d.text
      resultSource.value = d.source
      resultLink.value = d.link || ''
      persist()
      return
    }

    const text = await explainWithChatGPT(term)
    definition.value = text || '説明を取得できませんでした。'
    resultSource.value = 'ChatGPT'
    persist()
  } catch (e) {
    console.error(e)
    if (e?.name === 'AbortError') {
      definition.value = '通信がタイムアウトしました。電波状況を確認してもう一度お試しください。'
    } else {
      definition.value = 'エラーが発生しました。もう一度お試しください。'
    }
    resultSource.value = ''
    resultLink.value = ''
    persist()
  } finally {
    isLoading.value = false
  }
}

/* ===== Wikipedia ===== */
async function explainWithWikipedia(term) {
  const url = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`
  const res = await fetchWithTimeout(url, {}, 8000)
  if (!res.ok) return null

  const data = await res.json()
  const text = (data?.extract || '').trim()
  if (!text) return null

  const link = data?.content_urls?.desktop?.page || ''
  return { text, source: 'Wikipedia', link }
}

/* ===== 辞書チェーン（FreeDictionary → JLPT） ===== */
async function explainWithDictChain(term) {
  const a = await explainWithFreeDictionary(term)
  if (a) return a

  const b = await explainWithJlptVocab(term)
  if (b) return b

  return null
}

/* Free Dictionary API（英語向け。英字っぽい時だけ叩く） */
async function explainWithFreeDictionary(term) {
  if (!looksEnglish(term)) return null

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`
 const res = await fetchWithTimeout(url, {}, 8000)
  if (!res.ok) return null

  const data = await res.json()
  const first = data?.[0]
  const meaning0 = first?.meanings?.[0]
  const def0 = meaning0?.definitions?.[0]?.definition?.trim()
  const ex0 = meaning0?.definitions?.[0]?.example?.trim()

  if (!def0) return null
  const text = ex0 ? `${def0}（例: ${ex0}）` : def0

  return { text, source: '辞書(FreeDictionary)', link: 'https://dictionaryapi.dev/' }
}

function looksEnglish(s) {
  return /^[A-Za-z][A-Za-z\-']{0,64}$/.test(s)
}

/* JLPT Vocabulary API（/api/words?word=...） */
async function explainWithJlptVocab(term) {
  const url = `https://jlpt-vocab-api.vercel.app/api/words?word=${encodeURIComponent(term)}`
  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()

  // 返り値が変わっても落ちないように保守的に
  const item =
    (Array.isArray(data) ? data[0]
      : Array.isArray(data?.words) ? data.words[0]
      : null)

  if (!item) return null

  // 想定: { word, meaning, furigana, level }
  const meaning = (item.meaning || '').trim()
  if (!meaning) return null

  const furigana = (item.furigana || '').trim()
  const lvl = item.level != null ? `N${item.level}` : ''
  const head = [furigana || item.word || term, lvl].filter(Boolean).join(' ')

  // 表示は短め（長すぎる場合は既存のMAX_DEF_LENで切れる）
  const text = head ? `${head}\n${meaning}` : meaning

  return { text, source: '辞書(JLPT)', link: 'https://jlpt-vocab-api.vercel.app/' }
}

/* ===== ChatGPT ===== */
async function explainWithChatGPT(term) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return '（OpenAI APIキー未設定）'

  const sys =
    'あなたは用語の意味をわかりやすく日本語で簡潔に説明するアシスタントです。専門的すぎる言い回しを避け、最長200文字程度で要点をまとめてください。また、ですます調でなく、である調で説明してください。'
  const user = `用語: 「${term}」とは何か、論文を読む人向けに簡潔に説明してください。`

  const res = await fetchWithTimeout(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
      }),
    },
    15000
  )

  if (!res.ok) {
    if (res.status === 401) return 'OpenAI APIキーが無効です（401）。'
    if (res.status === 429) return '混雑しています（429）。少し待ってから再試行してください。'
    if (res.status >= 500) return 'OpenAI側で一時的な障害が発生しています。少し待ってから再試行してください。'
    return `ChatGPT呼び出しでエラーが発生しました（${res.status}）。`
  }

  const json = await res.json()
  return json?.choices?.[0]?.message?.content?.trim() || ''
}


/* ===== ローカル保存 ===== */
const LS_KEY = 'mvp_reader_state_v2'

function persist() {
  const payload = {
    manualInput: manualInput.value,
    rawText: rawText.value,
    fontSize: fontSize.value,
    lineHeight: lineHeight.value,
    contentWidth: contentWidth.value,
    theme: theme.value,
    wrapMode: wrapMode.value,
    explainEngine: explainEngine.value,
    selectedWord: selectedWord.value,
    definition: definition.value,
    resultSource: resultSource.value,
    resultLink: resultLink.value,
  }
  localStorage.setItem(LS_KEY, JSON.stringify(payload))
}

function restore() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return
    const s = JSON.parse(raw)

    manualInput.value = s.manualInput ?? ''
    rawText.value = s.rawText ?? ''
    fontSize.value = Number(s.fontSize ?? 18)
    lineHeight.value = Number(s.lineHeight ?? 1.9)
    contentWidth.value = Number(s.contentWidth ?? 760)
    theme.value = s.theme ?? 'light'
    wrapMode.value = s.wrapMode ?? 'wrap'

    explainEngine.value = s.explainEngine ?? 'wiki'
    selectedWord.value = s.selectedWord ?? ''
    definition.value = s.definition ?? ''
    resultSource.value = s.resultSource ?? ''
    resultLink.value = s.resultLink ?? ''
  } catch (e) {
    console.warn('restore failed', e)
  }
}

/* 設定が変わったら自動保存 */
watch([fontSize, lineHeight, contentWidth, theme, wrapMode, explainEngine], () => {
  persist()
  applyBodyTheme()
})

onMounted(() => {
  restore()
  applyBodyTheme()
})

function flashSavedHint(msg) {
  savedHint.value = msg
  setTimeout(() => (savedHint.value = ''), 1200)
}

//　タイムアウト
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

</script>

<style scoped>
/* ===== テーマ変数（layout全体に効かせる） ===== */
.layout.theme-light{
  --page-bg: #f6f7f9;
  --panel-bg: #ffffff;
  --panel-stroke: #e5e7eb;
  --ink: #111827;
  --ink-muted: #6b7280;
  --btn-bg: #f3f4f6;
  --btn-stroke: #d1d5db;
  --link: #2563eb;
}

.layout.theme-dark{
  --page-bg: #0b1220;
  --panel-bg: #0f1b2d;
  --panel-stroke: #23324b;
  --ink: #e5e7eb;
  --ink-muted: #9ca3af;
  --btn-bg: #13233a;
  --btn-stroke: #2b3c59;
  --link: #7dd3fc;
}

/* ===== レイアウト ===== */
.layout{
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  background: var(--page-bg);
  padding: 14px;
}

/* パネル */
.panel{
  background: var(--panel-bg);
  color: var(--ink);
  border: 1px solid var(--panel-stroke);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.label{
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 8px;
}

/* 入力 */
.manual-input{
  width: 100%;
  min-height: 180px;
  padding: 12px 14px;
  font-size: 1rem;
  border: 1px solid var(--btn-stroke);
  border-radius: 12px;
  resize: vertical;
  background: var(--panel-bg);
  color: var(--ink);
  outline: none;
}
.manual-input:focus{
  border-color: #9ca3af;
  box-shadow: 0 0 0 3px rgba(156,163,175,0.25);
}

/* 操作 */
.controls{
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 10px;
}

.action-btn{
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--btn-stroke);
  background: var(--btn-bg);
  color: var(--ink);
  cursor: pointer;
}
.action-btn:hover{ opacity: 0.9; }
.action-btn:disabled{
  opacity: 0.6;
  cursor: not-allowed;
}
.action-btn--ghost{
  background: transparent;
}

.hint{
  color: var(--ink-muted);
  font-size: 0.9rem;
}

/* 設定行 */
.row{
  display: grid;
  grid-template-columns: 120px 1fr 80px;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}
.row-label{
  color: var(--ink-muted);
  font-weight: 600;
}
.row-val{
  text-align: right;
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
}

.engine-opt{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-muted);
}

/* 本文 */
.text-container{ padding-bottom: 10px; }
.reader{
  margin: 0 auto;
  max-width: var(--reader-width);
  font-size: var(--reader-font-size);
  line-height: var(--reader-line-height);
  color: var(--ink);
}

/* 改行そのままモード */
.raw-pre{
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
}

/* 横幅回り込みモード */
.mode-wrap p{
  margin: 0 0 1em;
  white-space: normal;
  word-break: break-word;
}

.empty{
  color: var(--ink-muted);
  margin: 0;
}

/* ===== 下固定の解説 ===== */
.fixed-definition{
  /* position: static; ← 削除する */
  position: relative;          /* もしくはこの行自体なくてもOK */

  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid var(--panel-stroke);
  border-left: none;
  border-right: none;
  border-bottom: none;
  border-radius: 0;            /* ← バー感を戻す */

  padding: 14px;
  box-shadow: 0 -8px 18px rgba(0,0,0,0.08);

  display: flex;
  gap: 10px;
  align-items: baseline;
  flex-wrap: wrap;
  color: var(--ink);
}

.fixed-stack{
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

/* ダーク時は下固定も暗く */
.layout.theme-dark .fixed-definition{
  background: rgba(15, 27, 45, 0.96);
}

.def-word{ font-weight: 800; }
.def-text{
  flex: 1 1 auto;
  min-width: 240px;
  color: var(--ink);
}

.source{
  font-size: .9rem;
  color: var(--ink-muted);
}
.source a{
  margin-left: 8px;
  color: var(--link);
  text-decoration: underline;
}

.def-controls{
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.engine-label{
  font-weight: 700;
  color: var(--ink-muted);
}

.error{
  width: 100%;
  margin-top: 6px;
  color: #b91c1c;
}
.layout.theme-dark .error{
  color: #fca5a5;
}

/* 下固定ぶんの余白 */
.definition-spacer{ height: 110px; }

/* =========================
   Mobile tweaks (InteractiveText)
   ========================= */
@media (max-width: 640px){
  .layout{
    padding: 10px;
    gap: 10px;
  }

  .panel{
    padding: 12px;
    border-radius: 12px;
  }

  .manual-input{
    min-height: 140px;
  }

  /* スライダー行を縦積みにして詰まり防止 */
  .row{
    grid-template-columns: 1fr;
  }
  .row-val{
    text-align: left;
  }

  /* 下固定（解説＋広告）がスマホで詰まらないように */
  .def-controls{
    gap: 8px;
  }

  /* 下固定ぶんの余白（スマホは少し大きめ） */
  .definition-spacer{
    height: 190px;
  }
}
@media (max-width: 640px){
  /* 設定行を縦積みにして横はみ出し防止 */
  .row{
    grid-template-columns: 1fr;
  }
  .row-val{
    text-align: left;
  }

  /* 念のため：全体がはみ出さないように */
  .layout, .panel, .manual-input, .reader{
    max-width: 100%;
  }
}


</style>