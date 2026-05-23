const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const errorHandler = require('./middleware/error');

const app = express();

// 1. Middleware configuration
app.use(cors({
  origin: '*', // In production, replace with specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Allow parsing JSON request bodies

// 2. Health check / Root route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Resume Builder & Analyzer API is running smoothly!',
    documentation: 'See README.md for endpoint integration details.'
  });
});

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ats', require('./routes/atsRoutes'));

// 4. Fallback route for unmatched endpoints
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// 5. Global Error Handling Middleware
app.use(errorHandler);

// 6. MongoDB Connection Setup
const PORT = process.env.PORT || 5001;
// User connection string request fallback:
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_resume_builder';

console.log('Connecting to MongoDB database...');
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Database!');
    app.listen(PORT, () => {
      console.log(`Server is happily listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode!`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed! Error details:', err.message);
    console.log('Ensure MongoDB local service is running or check the connection string in your .env file.');
    
    // Starting the server even if DB connection fails so frontend can see API responses or custom error states
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} without active database connection.`);
    });
  });
