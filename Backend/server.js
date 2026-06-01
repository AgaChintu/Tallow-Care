import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;


// ── Connect Database ───────────────────────────────
connectDB();


// ── Middleware ─────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,           // e.g. https://tallow-care.vercel.app
  'http://localhost:5173',           // Vite dev server
  'http://localhost:5174',           // Vite fallback port
].filter(Boolean);                   // remove undefined/empty entries

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // Allow server-to-server requests (no Origin header) and all listed origins
      if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${incomingOrigin}`);
        callback(new Error(`CORS: origin ${incomingOrigin} is not allowed.`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// ── Routes ─────────────────────────────────────────
app.use('/auth', authRoutes);

// NEW CONTACT ROUTE
app.use('/contact', contactRoutes);


// ── Health Check ───────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Tallow Care API is running 🌿',
  });
});


// ── 404 Handler ────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});


// ── Global Error Handler ───────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);

  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
});


// ── Start Server ───────────────────────────────────
app.listen(PORT, () => {
  console.log(
    `🌿 Tallow Care API running on http://localhost:${PORT}`
  );

  console.log(
    `📋 Health check: http://localhost:${PORT}/health`
  );
});
