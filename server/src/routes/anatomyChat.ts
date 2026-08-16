import { Router } from 'express';
import { handleAnatomyChat } from '../services/llmProvider';

const router = Router();
const allowedModes = ['ask', 'explain-simply', 'deep-dive', 'study-summary', 'quiz-me', 'compare'] as const;

router.post('/anatomy-chat', async (req, res) => {
  try {
    const { question, anatomyContext, compareContext, mode } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (question.length > 1000) {
      return res.status(400).json({ error: 'Question too long' });
    }

    if (!anatomyContext || typeof anatomyContext !== 'object' || !anatomyContext.id) {
      return res.status(400).json({ error: 'Invalid anatomyContext' });
    }

    if (compareContext !== undefined && (!compareContext || typeof compareContext !== 'object' || !compareContext.id)) {
      return res.status(400).json({ error: 'Invalid compareContext' });
    }

    const allowedMode: typeof allowedModes[number] = typeof mode === 'string' && allowedModes.includes(mode as typeof allowedModes[number])
      ? (mode as typeof allowedModes[number])
      : 'ask';

    if (allowedMode === 'compare' && (!compareContext || typeof compareContext !== 'object' || !compareContext.id)) {
      return res.status(400).json({ error: 'Compare mode requires a second anatomy context' });
    }

    const result = await handleAnatomyChat({ question, anatomyContext, compareContext, mode: allowedMode });
    return res.json(result);
  } catch (err) {
    console.error('anatomy-chat error', err instanceof Error ? err.message : err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

export default router;
