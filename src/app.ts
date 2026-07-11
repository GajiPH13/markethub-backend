import express from "express";

export const app = express();

app.use(express.json());

app.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Welcome to the MarketHub API",
    healthCheck: "/api/v1/health",
  });
});

app.get("/api/v1/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "MarketHub API is running",
  });
});