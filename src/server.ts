/* eslint-disable no-console */
import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);
        console.log("✅ Connected to Database");

        server = app.listen(envVars.PORT, () => {
            console.log(`✅ Server is listening on port ${envVars.PORT}`);
        });
    } catch (error) {
        console.log(`❌ Error from server`, error);
    }
};

(async () => {
    await startServer();
    await seedSuperAdmin();
})();

process.on("SIGTERM", () => {
    console.log("SIGTERM signal received... Server shutting down...");

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }

    process.exit(1);
});

process.on("SIGINT", () => {
    console.log("SIGINT signal received... Server shutting down...");

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }

    process.exit(1);
});

process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection Detected... Server shutting down...", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }

    process.exit(1);
});

process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception Detected... Server shutting down...", error);

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }

    process.exit(1);
});
