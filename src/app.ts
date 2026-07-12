import cors from "cors";
import express from "express";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./modules/auth/auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

const frontendUrl =
  process.env.FRONTEND_URL ?? "http://localhost:3000";

/*
 * Security headers
 */
app.use(helmet());

/*
 * CORS configuration
 */
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],
  }),
);

/*
 * Better Auth must be mounted before express.json().
 *
 * Express 5 wildcard syntax:
 * /api/auth/*splat
 */
app.all("/api/auth/*splat", toNodeHandler(auth));

/*
 * Request body parsers
 */
app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

/*
 * Root API information
 */
app.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "MarketHub API is running.",
  });
});

/*
 * API health check
 */
app.get("/api/v1/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "MarketHub API is healthy.",
    timestamp: new Date().toISOString(),
  });
});

/*
 * Application API routes
 */
app.use("/api/v1", apiRouter);

/*
 * These must be mounted after every application route.
 */
app.use(notFoundHandler);

/*
 * The error handler must always be last.
 */
app.use(errorHandler);