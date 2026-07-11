import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { fromNodeHeaders } from "better-auth/node";

import { getDatabase } from "./database/mongodb.js";
import { auth } from "./modules/auth/auth.js";

const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
  throw new Error("FRONTEND_URL is missing.");
}

export const app = express();

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/*
 * Better Auth must be mounted before express.json().
 * Express 5 requires the named wildcard syntax.
 */
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/v1/auth/session", async (request, response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    response.status(401).json({
      success: false,
      message: "Authentication required.",
    });

    return;
  }

  response.status(200).json({
    success: true,
    message: "Session retrieved successfully.",
    data: session,
  });
});

app.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Welcome to the MarketHub API",
    healthCheck: "/api/v1/health",
  });
});

app.get("/api/v1/health", async (_request, response) => {
  try {
    await getDatabase().command({ ping: 1 });

    response.status(200).json({
      success: true,
      message: "MarketHub API is healthy",
      data: {
        api: "connected",
        database: "connected",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    response.status(503).json({
      success: false,
      message: "MarketHub API is unavailable",
    });
  }
});