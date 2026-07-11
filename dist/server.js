import "dotenv/config";
import { app } from "./app.js";
const port = Number(process.env.PORT) || 5000;
const server = app.listen(port, () => {
    console.log(`MarketHub API running at http://localhost:${port}`);
});
const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully.`);
    server.close((error) => {
        if (error) {
            console.error("Failed to close the server:", error);
            process.exit(1);
        }
        process.exit(0);
    });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
//# sourceMappingURL=server.js.map