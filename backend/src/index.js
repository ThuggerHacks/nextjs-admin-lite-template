const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cronService = require('./services/cronService');
const { logError } = require('./utils/errorLogger');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));

// Configure for large file uploads
app.use(express.json({ limit: '10gb' }));
app.use(express.urlencoded({ extended: true, limit: '10gb' }));

// Increase timeout for large uploads
app.use((req, res, next) => {
  res.setTimeout(300000); // 5 minutes
  next();
});

// Serve static files from uploads directory
app.use('/api/uploads/files', express.static(path.join(__dirname, '../uploads')));

// Serve static files from library uploads directory
app.use('/api/uploads/libraries', express.static(path.join(__dirname, '../uploads/libraries')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
// app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/folders', require('./routes/folders'));
app.use('/api/files', require('./routes/files'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/libraries', require('./routes/libraries'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/scans', require('./routes/scans'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/sucursals', require('./routes/sucursals'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/error-logs', require('./routes/errorLogs'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Error handling middleware
app.use(async (err, req, res, next) => {
  console.error(err.stack);
  
  // Log error using our error logger
  try {
    await logError('UNHANDLED_ERROR', 'Unhandled error occurred', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }

  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', async (req, res) => {
  try {
    await logError('NOT_FOUND_ERROR', 'Route not found', {
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  } catch (logError) {
    console.error('Failed to log 404 error:', logError);
  }
  
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Start cron service
  try {
    cronService.start();
  } catch (error) {
    console.error('Failed to start cron service:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  cronService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  cronService.stop();
  process.exit(0);
}); 