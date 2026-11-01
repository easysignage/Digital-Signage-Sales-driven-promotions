// Auto mode: sales drift on their own so the promo switches without anyone clicking.
// It swings in waves around the threshold so it actually crosses it during a short recording.
import { setSales, state } from "./promo.ts";
import { emitState, log } from "./log.ts";

const TICK_MS = 4000;
let timer: NodeJS.Timeout | undefined;
let phase = 0;

export function setAuto(on: boolean): void {
  if (state.auto === on && Boolean(timer) === on) return;
  state.auto = on;
  clearInterval(timer);
  timer = undefined;
  if (on) {
    log("info", `Auto mode on: sales change every ${TICK_MS / 1000}s.`);
    timer = setInterval(tick, TICK_MS);
  } else {
    log("info", "Auto mode off.");
  }
  emitState(state);
}

function tick(): void {
  if (!state.auto) return setAuto(false);
  phase += 0.6;
  const wave = Math.sin(phase) * state.threshold * 0.45;
  const noise = (Math.random() - 0.5) * state.threshold * 0.15;
  const next = Math.max(0, Math.round(state.threshold + wave + noise));
  setSales(next).catch(() => {});
}
