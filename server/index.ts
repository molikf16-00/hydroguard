import express from "express";
import path from "node:path";
import { Collector } from "./collector";

const app = express();
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
const collector = new Collector(
  path.resolve(process.env.HYDROGUARD_DATA_DIR ?? "./data"),
);
await collector.restore();
void collector.refresh();
const timer = setInterval(() => void collector.refresh(), 600000);
app.get("/api/health", (_req, res) => {
  const current = collector.current();
  res.setHeader("Cache-Control", "no-store");
  res.status(current ? 200 : 503).json({
    status: current ? (current.isCached ? "degraded" : "ok") : "unavailable",
    lastSuccess: collector.lastSuccess,
    collectionError: collector.lastError,
    scoringVersion: "2.0",
  });
});
app.get("/api/catchment", (_req, res) => {
  const result = collector.current();
  res.setHeader("Cache-Control", "no-store");
  if (!result) {
    res.status(503).json({
      error: "No recent valid live data. Collection retries every 10 minutes.",
    });
    return;
  }
  res.json(result);
});
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Unknown endpoint" });
});
app.use(express.static(path.resolve("dist"), { maxAge: "1h", index: false }));
app.get("*", (_req, res) => {
  res.sendFile(path.resolve("dist/index.html"));
});
const server = app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0", () =>
  console.log(`HydroGuard listening on port ${process.env.PORT ?? 3000}`),
);
function stop() {
  clearInterval(timer);
  server.close(() => process.exit(0));
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
