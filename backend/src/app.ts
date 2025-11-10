import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import analyticsRouter from "./routes/analytics";
import aiRouter from "./routes/ai";
import playersRouter from "./routes/players";
import progressRouter from "./routes/progress";
import sessionsRouter from "./routes/sessions";
import wordsRouter from "./routes/words";
import { createErrorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";

const app = express();

app.use(helmet({
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", authMiddleware);
app.use("/api/words", wordsRouter);
app.use("/api/players", playersRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/progress", progressRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api", aiRouter);

app.use(createErrorHandler());

export default app;
