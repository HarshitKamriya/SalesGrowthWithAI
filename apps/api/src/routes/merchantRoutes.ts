import { Router } from 'express';
import { CreateCampaignSchema } from '@ai-commerce/shared';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth.js';
import {
  getMerchantAnalyticsService,
  getCampaignsService,
  createCampaignService,
  approveCampaignService,
  getKnowledgeGraphService
} from '../services/merchantService.js';

const router = Router();

router.use(authenticateJWT);

router.get('/analytics', async (req: AuthRequest, res, next) => {
  try {
    const analytics = await getMerchantAnalyticsService();
    return res.json({ success: true, data: { analytics } });
  } catch (err) {
    next(err);
  }
});

router.get('/graph', async (req: AuthRequest, res, next) => {
  try {
    const graphData = await getKnowledgeGraphService();
    return res.json({ success: true, data: { graph: graphData } });
  } catch (err) {
    next(err);
  }
});

router.get('/campaigns', async (req: AuthRequest, res, next) => {
  try {
    const campaigns = await getCampaignsService();
    return res.json({ success: true, data: { campaigns } });
  } catch (err) {
    next(err);
  }
});

router.post('/campaigns', async (req: AuthRequest, res, next) => {
  try {
    const data = CreateCampaignSchema.parse(req.body);
    const campaign = await createCampaignService(data);
    return res.status(201).json({ success: true, data: { campaign } });
  } catch (err) {
    next(err);
  }
});

router.post('/campaigns/:id/approve', async (req: AuthRequest, res, next) => {
  try {
    const campaign = await approveCampaignService(req.params.id);
    return res.json({ success: true, data: { campaign } });
  } catch (err) {
    next(err);
  }
});

export default router;
