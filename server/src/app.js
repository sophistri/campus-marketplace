import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import listingsRoutes from './routes/listings.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import conversationsRoutes from './routes/conversations.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// serve uploaded listing photos as static files
app.use('/uploads', express.static(path.resolve('uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/admin', adminRoutes);

// multer errors (file too large, bad type, etc.) land here
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message?.includes('images are allowed')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;