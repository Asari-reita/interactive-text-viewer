import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fetch from 'node-fetch'
import FormData from 'form-data'

const app = express()
app.use(cors())
const upload = multer({ storage: multer.memoryStorage() })

// 環境変数: GROBIDのURL（デフォルトはローカル）
const GROBID_BASE = process.env.GROBID_BASE || 'http://localhost:8070'

// ヘルスチェック
app.get('/grobid/health', async (req, res) => {
  try {
    const r = await fetch(`${GROBID_BASE}/api/isalive`)
    const txt = await r.text()
    res.type('text/plain').send(txt)
  } catch (e) {
    res.status(502).send('GROBID not reachable')
  }
})

// フルテキスト抽出（TEI-XMLをそのまま返す）
app.post('/grobid/fulltext', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('file missing')

  try {
    const fd = new FormData()
    // GROBIDはフィールド名 input で受ける（multipart/form-data）
    fd.append('input', req.file.buffer, { filename: req.file.originalname || 'upload.pdf' })

    // 代表的なオプション（必要に応じて調整可）
    fd.append('consolidateCitations', '1')     // 参考文献の正規化を試みる
    fd.append('segmentSentences', '1')         // 文分割
    // 返すTEI内に座標メタデータを入れる（複数指定可）
    for (const k of ['ref', 'bibl', 'figure', 's', 'head', 'note']) {
      fd.append('teiCoordinates', k)
    }

    const r = await fetch(`${GROBID_BASE}/api/processFulltextDocument`, {
      method: 'POST',
      body: fd,
      headers: fd.getHeaders()
    })

    const xml = await r.text()
    if (!r.ok) return res.status(r.status).type('text/plain').send(xml)

    // ブラウザ側でDOMParserしやすいようXMLで返す
    res.type('application/xml').send(xml)
  } catch (e) {
    console.error(e)
    res.status(502).send('proxy error')
  }
})

const port = process.env.PORT || 8787
app.listen(port, () => {
  console.log(`GROBID proxy on http://localhost:${port}`)
})
