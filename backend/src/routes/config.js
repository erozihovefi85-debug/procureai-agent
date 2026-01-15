import express from 'express';
import dotenv from 'dotenv';

const router = express.Router();

// 重新加载环境变量以确保最新配置
dotenv.config();

/**
 * 获取配置状态
 */
router.get('/status', (req, res) => {
  const config = {
    useThirdParty: process.env.USE_THIRD_PARTY_API === 'true',
    thirdPartyConfigured: !!(process.env.THIRD_PARTY_API_KEY && process.env.THIRD_PARTY_API_SECRET),
    thirdPartyUrl: process.env.THIRD_PARTY_API_URL,
    thirdPartyKeyPrefix: process.env.THIRD_PARTY_API_KEY ? process.env.THIRD_PARTY_API_KEY.substring(0, 5) + '***' : 'not configured',
    taobaoConfigured: !!(process.env.TAOBAO_APP_KEY && process.env.TAOBAO_APP_SECRET),
    currentProvider: process.env.USE_THIRD_PARTY_API === 'true' ? 'third-party' : 'taobao-official',
    nodeEnv: process.env.NODE_ENV,
  };
  
  res.json(config);
});

export default router;
