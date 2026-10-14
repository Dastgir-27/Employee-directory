import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "100kb" }));

app.use("/api/health", healthRoutes);
app.use("/api/employees", employeeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
