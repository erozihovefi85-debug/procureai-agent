import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import { initBuiltinSkills } from './services/skillRegistry.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database and initialize skills
connectDB().then(async () => {
  try {
    await initBuiltinSkills();
    console.log('[Init] Builtin skills initialized');
  } catch (error) {
    console.error('[Init] Failed to initialize builtin skills:', error.message);
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
import apiRoutes from './routes/index.js';
import authRoutes from './routes/auth.js';
import conversationRoutes from './routes/conversations.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import configRoutes from './routes/config.js';
import supplierRoutes from './routes/suppliers.js';
import productRoutes from './routes/products.js';
import requirementListRoutes from './routes/requirementList.js';
import procurementCategoriesRoutes from './routes/procurementCategories.js';
import skillRoutes from './routes/skills.js';
import agentChatRoutes from './routes/agentChat.js';

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/config', configRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/requirement-list', requirementListRoutes);
app.use('/api/procurement-categories', procurementCategoriesRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/agent', agentChatRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═════════════════════════════════════════════╗
  ║     ProcureAI Backend Server                ║
  ╠═════════════════════════════════════════════╣
  ║  Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(21)}║
  ║  Port: ${PORT}${' '.repeat(34)}║
  ║  Time: ${new Date().toLocaleString('zh-CN')}${' '.repeat(10)}║
  ╚═════════════════════════════════════════════╝
  `);

  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
});
