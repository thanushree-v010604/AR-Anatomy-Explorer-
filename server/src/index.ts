import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import anatomyRouter from './routes/anatomyChat';

// Load the project-root .env during local development.
// Render provides environment variables directly.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (process.env.GROQ_API_KEY) {
  console.log('GROQ_API_KEY detected');
} else {
  console.log('GROQ_API_KEY missing');
}

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json({ limit: '50kb' }));

app.use('/api', anatomyRouter);

app.get('/', (_req, res) => {
  res.send('AR Anatomy Explorer AI backend');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});