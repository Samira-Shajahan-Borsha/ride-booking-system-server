import app from "./app";
import { Server } from "http";

let server: Server;
const port = 5000;

const startServer = async () => {
  try {
    server = app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(`Error from server`);
  }
};

startServer();

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
