import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { analyzeTranscript } from './analyze.js';
import { extractText } from './extract.js';

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded. Provide a PDF or TXT file.'
      });
    }

    const filename = req.file.originalname.toLowerCase();
    if (!filename.endsWith('.pdf') && !filename.endsWith('.txt')) {
      return res.status(400).json({
        error: 'Unsupported file type. Upload PDF or TXT.'
      });
    }

    const text = await extractText(req.file);

    if (text.length < 800) {
      return res.status(422).json({
        error: 'Transcript too short',
        detail: `Extracted ${text.length} characters. Minimum 800 required.`
      });
    }

    const result = await analyzeTranscript(text);
    return res.json(result);

  } catch (err) {
    console.error('[/analyze] Error:', err);
    return res.status(500).json({
      error: 'Analysis failed',
      detail: err.message
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on :${PORT}`);
});
