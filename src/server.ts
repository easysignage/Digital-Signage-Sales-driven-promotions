import express from "express";
import { fileURLToPath } from "node:url";
import { config } from "./config.ts";
import { log, sse } from "./log.ts";
import { reset, setSales, state } from "./promo.ts";
import { setAuto } from "./simulator.ts";

const LOW = Math.round(config.threshold * 0.6);
const HIGH = Math.round(config.threshold * 1.4);

const app = express();
app.use(express.json());
app.use(express.static(fileURLToPath(new URL("../public", import.meta.url))));

app.get("/api/state", (_req, res) => res.json(state));
app.get("/api/events", sse(() => state));

app.post("/api/sales", async (req, res) => {
  try {
    await setSales(Number(req.body?.value));
    res.json(state);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post("/api/sales/drop", async (_req, res) => {
  setAuto(false);
  await setSales(LOW);
  res.json(state);
});

app.post("/api/sales/pickup", async (_req, res) => {
  setAuto(false);
  await setSales(HIGH);
  res.json(state);
});

app.post("/api/auto", (req, res) => {
  setAuto(Boolean(req.body?.on));
  res.json(state);
});

app.post("/api/reset", async (_req, res) => {
  setAuto(false);
  await reset();
  res.json(state);
});

// Local only: the server holds the API key, so it is not exposed to the network.
app.listen(config.port, "127.0.0.1", () => {
  log("info", `Sales-driven promotions demo on http://localhost:${config.port}`);
  log("info", `Promo tag "${config.promoTag}", screen tag "${config.screenTag}", threshold ${config.threshold}.`);
});
