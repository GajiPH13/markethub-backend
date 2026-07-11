import "dotenv/config";
import { app } from "./app.js";
import { closeDatabaseConnection, connectToDatabase, } from "./database/mongodb.js";
import { createDatabaseIndexes } from "./database/indexes.js";
const port = Number(process.env.PORT) || 5000;
async function startServer() {
    try {
        await connectToDatabase();
        await createDatabaseIndexes();
        const server = app.listen(port, () => {
            console.log(`MarketHub API running at http://localhost:${port}`);
            console.log(`Better Auth running at http://localhost:${port}/api/auth`);
        });
        let isShuttingDown = false;
        async function shutdown(signal) {
            if (isShuttingDown) {
                return;
            }
            isShuttingDown = true;
            console.log(`${signal} received. Shutting down gracefully.`);
            server.close(async (error) => {
                try {
                    if (error) {
                        console.error("HTTP server shutdown failed:", error);
                        process.exitCode = 1;
                    }
                    await closeDatabaseConnection();
                }
                catch (shutdownError) {
                    console.error("Shutdown failed:", shutdownError);
                    process.exitCode = 1;
                }
                finally {
                    process.exit();
                }
            });
        }
        process.on("SIGINT", () => {
            void shutdown("SIGINT");
        });
        process.on("SIGTERM", () => {
            void shutdown("SIGTERM");
        });
    }
    catch (error) {
        console.error("Failed to start MarketHub API:", error);
        process.exit(1);
    }
}
void startServer();
//# sourceMappingURL=server.js.map