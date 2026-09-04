import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transaction.routes";
import categoryRoutes from "./routes/category.routes";
import budgetRoutes from "./routes/budget.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { notFound, errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Personal Finance API is running"
  });
});

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/budgets", budgetRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;