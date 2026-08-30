import { Router } from 'express';
import { AgentChatSchema } from '@ai-commerce/shared';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';
import { defaultAgentOrchestrator } from '../agent/orchestrator.js';
import { getInMemoryStore, getMongoDb } from '../config/db.js';

const router = Router();

router.use(authenticateJWT);

router.post('/chat', async (req: AuthRequest, res, next) => {
  try {
    const data = AgentChatSchema.parse(req.body);
    const context = {
      userId: req.user?.userId || 'cust_demo_101',
      userRole: req.user?.role || 'CUSTOMER',
      ...data.context
    };

    const response = await defaultAgentOrchestrator.processChat(
      data.message,
      data.conversationHistory as any,
      context
    );

    return res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
});

router.get('/actions', async (req: AuthRequest, res, next) => {
  try {
    const memoryStore = getInMemoryStore();
    const db = getMongoDb();

    let actions = memoryStore.agentActions;
    if (db) {
      try {
        const dbActions = await db.collection('agent_actions').find().sort({ createdAt: -1 }).toArray();
        if (dbActions.length > 0) actions = dbActions as any;
      } catch (err) {}
    }

    return res.json({ success: true, data: { actions } });
  } catch (err) {
    next(err);
  }
});

export default router;
