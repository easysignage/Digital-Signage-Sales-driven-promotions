// The rule: sales above the threshold turn the promo on, below it turn the promo off.
// Each change is two API calls: switch the tagged media, then publish the tagged screens.
import { call, client, codeOf } from "./easysignage.ts";
import { config } from "./config.ts";
import { emitState, log } from "./log.ts";
import { decide, type Action } from "./rule.ts";


export interface State {
  sales: number;
  threshold: number;
  promoTag: string;
  screenTag: string;
  promoActive: boolean | null;
  busy: boolean;
  auto: boolean;
  history: { time: number; sales: number }[];
  lastAction?: { action: Action; time: string; matched?: number; updated?: number; screens: string };
}

export const state: State = {
  sales: config.threshold,
  threshold: config.threshold,
  promoTag: config.promoTag,
  screenTag: config.screenTag,
  promoActive: null,
  busy: false,
  auto: false,
  history: [],
};

// Every change runs through this chain, one at a time, so rapid clicks can never interleave
// an enable with a disable or publish out of order.
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    state.busy = true;
    emitState(state);
    try {
      return await job();
    } finally {
      state.busy = false;
      emitState(state);
    }
  });
  queue = run.catch(() => {});
  return run;
}

export function setSales(value: number): Promise<void> {
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000) {
    return Promise.reject(new RangeError("Sales must be a number between 0 and 1,000,000."));
  }
  state.sales = Math.round(value);
  state.history.push({ time: Date.now(), sales: state.sales });
  if (state.history.length > 60) state.history.shift();
  emitState(state);
  return enqueue(() => evaluate());
}

async function evaluate(): Promise<void> {
  // Re-read inside the queue: by now the value may have moved on from when it was queued.
  const { sales, threshold, promoActive } = state;
  const action = decide(sales, threshold, promoActive);
  if (!action) {
    const why = sales === threshold ? `sales are exactly ${threshold}` : `promo is already ${promoActive ? "ON" : "OFF"}`;
    log("info", `Sales ${sales}: no change (${why}).`);
    return;
  }
  log("info", `Sales ${sales} is ${action === "enable" ? "above" : "below"} ${threshold}: turning promo ${action === "enable" ? "ON" : "OFF"}.`);
  await apply(action);
}

async function apply(action: Action): Promise<void> {
  const tag = config.promoTag;
  try {
    const { result } =
      action === "enable"
        ? await call(`media.enableByTag("${tag}")`, () => client.media.enableByTag(tag))
        : await call(`media.disableByTag("${tag}")`, () => client.media.disableByTag(tag));
    const { matched, updated } = (result ?? {}) as { matched?: number; updated?: number };
    if (matched === 0) log("warn", `No media is tagged "${tag}". Tag your promo items in the CMS, or run npm run setup.`);

    // The media library has changed either way, so record it before publishing.
    state.promoActive = action === "enable";
    const screens = await publish();
    state.lastAction = { action, time: new Date().toISOString(), matched, updated, screens };
  } catch (err) {
    // Leave the state unknown so the next evaluation tries again.
    state.promoActive = null;
    log("error", `Could not turn promo ${action === "enable" ? "on" : "off"}: ${codeOf(err) ?? (err as Error).message}`);
  }
}

/** Publishes the tagged screens and describes the outcome for the UI. */
export async function publish(): Promise<string> {
  const tag = config.screenTag;
  try {
    const { code } = await call(`displays.publishByTag("${tag}")`, () => client.displays.publishByTag(tag));
    return describePublish(code);
  } catch (err) {
    const code = codeOf(err);
    if (code === "publish_no_players" || code === "some_players_update_error" || code === "feature_not_enabled") {
      return describePublish(code);
    }
    throw err;
  }
}

function describePublish(code: string | undefined): string {
  const tag = config.screenTag;
  switch (code) {
    case undefined:
      return "published";
    case "publish_no_players":
      log("warn", `No screens are tagged "${tag}". Tag a display in the CMS, then try again.`);
      return "no screens tagged";
    case "some_players_update_error":
      log("warn", "Some screens could not be updated. Check that they are online.");
      return "partly published";
    case "feature_not_enabled":
      log("error", "Publishing by tag is not included in this account's plan.");
      return "not published";
    default:
      log("warn", `Publish answered "${code}".`);
      return code;
  }
}

/** Promo off, screens published, sales back at the threshold: a clean start for the next take. */
export function reset(): Promise<void> {
  state.auto = false;
  return enqueue(async () => {
    state.sales = state.threshold;
    state.history = [{ time: Date.now(), sales: state.sales }];
    log("info", "Reset: turning promo OFF.");
    await apply("disable");
  });
}
