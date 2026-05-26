// 家計簿アプリ バックエンドサーバー
// Claude API を呼び出してレシート画像を解析する

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// メモリ上に画像を保持（ディスクに保存しない）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 上限
});

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json());

// レシート画像解析エンドポイント
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '画像ファイルが見つかりません' });
  }

  // 画像を Base64 に変換
  const imageBase64 = req.file.buffer.toString('base64');
  const mediaType = req.file.mimetype;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `このレシート画像を解析して、以下のJSON形式で商品情報を返してください。
日付が読み取れない場合は今日の日付を使用してください。
カテゴリは以下から最も適切なものを選んでください：食費、外食、日用品、交通費、娯楽、医療、衣類、その他

必ず以下のJSON形式のみを返してください（説明文は不要）:
{
  "date": "YYYY-MM-DD",
  "store": "店舗名",
  "items": [
    {
      "name": "商品名",
      "amount": 金額（数値）,
      "category": "カテゴリ"
    }
  ],
  "total": 合計金額（数値）
}`,
            },
          ],
        },
      ],
    });

    // Claude の応答からJSON部分を抽出
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSONの抽出に失敗しました');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (error) {
    console.error('Claude API エラー:', error);
    res.status(500).json({ error: 'レシートの解析に失敗しました: ' + error.message });
  }
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
