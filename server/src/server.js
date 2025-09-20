import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import { requestLogger, errorLogger } from "./middleware/logger.js";
import authRoutes from './routes/auth.js'

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:8080",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan("dev"));
  app.use(requestLogger);
} else {
  app.use(morgan("combined"));
}

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Jan Samadhan API is running!",
    version: "1.0.0",
    endpoints: {
      complaints: "/api/complaints",
      health: "/api/health"
    }
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Jan Samadhan API is healthy!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use("/api/complaints", complaintRoutes);
app.use('/api/auth', authRoutes)

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      "GET /",
      "GET /api/health", 
      "GET /api/complaints",
      "POST /api/complaints",
      "GET /api/complaints/:id",
      "PUT /api/complaints/:id",
      "DELETE /api/complaints/:id"
    ]
  });
});

// Error logging middleware
app.use(errorLogger);

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export default app;