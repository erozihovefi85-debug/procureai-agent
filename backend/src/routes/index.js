import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    name: 'ProcureAI Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      conversations: '/api/conversations',
      chat: '/api/chat',
      imageSearch: '/api/image-search',
      admin: '/api/admin',
      suppliers: '/api/suppliers',
      products: '/api/products',
    },
  });
});

export default router;
