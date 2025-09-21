import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import authRoutes from './routes/auth.js';
import imageRoutes from './routes/imageRoutes.js';
import { Server } from "socket.io";
import { createServer } from "http";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-public", () => {
    socket.join("public-map");
    console.log(`Socket ${socket.id} joined public map room`);
  });

  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Socket ${socket.id} joined user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

export const broadcastNewComplaint = (complaint) => {
  io.to("public-map").emit("new-complaint", complaint);
};

app.use(cors({
  origin: "*",
  credentials: true
}));

app.options("*", cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

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
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);

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
      "DELETE /api/complaints/:id",
      "POST /api/images/upload",
      "DELETE /api/images/:publicId",
      "GET /api/images/:publicId/info"
    ]
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation: https://jansamadhan.onrender.com`);
  console.log(`Health Check:  https://jansamadhan.onrender.com/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;