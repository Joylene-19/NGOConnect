import express, { type Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:Joylene%25123@cluster0.mjucbrq.mongodb.net/ngoconnect?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Set mongoose options for better connection handling
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      heartbeatFrequencyMS: 2000, // Send a ping every 2s
    });
    
    log("✅ Connected to MongoDB Atlas successfully");
    log(`📊 Database: ${mongoose.connection.db?.databaseName}`);
    log(`🌐 Connection state: ${mongoose.connection.readyState}`);
  } catch (error) {
    log("❌ MongoDB connection error:");
    if (error instanceof Error) {
      log(`   Error message: ${error.message}`);
      
      // Provide helpful error guidance
      if (error.message.includes('bad auth')) {
        log("   💡 Check your username and password in MongoDB Atlas");
        log("   💡 Ensure the database user exists and has proper permissions");
      } else if (error.message.includes('ENOTFOUND')) {
        log("   💡 Check your cluster URL and network connection");
      } else if (error.message.includes('IP')) {
        log("   💡 Check if your IP address is whitelisted in MongoDB Atlas");
      }
    }
    process.exit(1);
  }
};

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (error) => {
  log('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  log('🔌 Mongoose disconnected from MongoDB Atlas');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  log('🛑 MongoDB connection closed due to app termination');
  process.exit(0);
});

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both Vite and potential other dev servers
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to log incoming request data
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
    log(`📝 Incoming ${req.method} ${req.path} with data:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB first
  await connectDB();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on port 3001 for backend API
  // Frontend will run on 5173 via Vite
  const port = Number(process.env.PORT) || 3001;
 server.listen(port, 'localhost', () => {
  log(`✅ Backend server is running on http://localhost:${port}`);
});
})();
