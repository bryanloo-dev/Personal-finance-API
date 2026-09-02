import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Personal Finance API is running"
  });
});

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

export default app;