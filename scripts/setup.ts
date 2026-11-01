// One-off account setup for the demo. Safe to run again: it reuses what already exists.
//
// 1. Finds or creates the "Sales demo" playlist.
// 2. Uploads the images in samples/ into it. Files named promo-* are tagged with PROMO_TAG.
// 3. Assigns the playlist to every screen tagged SCREEN_TAG and publishes them.
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { call, client, codeOf, playlistMedia } from "../src/easysignage.ts";
import { config } from "../src/config.ts";

const PLAYLIST_NAME = "Sales demo";
const samplesDir = fileURLToPath(new URL("../samples", import.meta.url));

async function findPlaylist(): Promise<string | undefined> {
  for await (const p of client.playlists.iterate()) {
    if (p.name === PLAYLIST_NAME && typeof p.id === "string") return p.id;
  }
}

let playlistId = await findPlaylist();
if (playlistId) {
  console.log(`Using playlist "${PLAYLIST_NAME}" (${playlistId}).`);
} else {
  const { result } = await call(`playlists.create({ name: "${PLAYLIST_NAME}", type: "horizontal" })`, () =>
    // `type` is the orientation and the API requires it: "horizontal" (1920×1080) or "vertical".
    client.playlists.create({ name: PLAYLIST_NAME, type: "horizontal" }),
  );
  playlistId = result.id;
}

const existing = new Set<string>();
for await (const m of playlistMedia(playlistId)) {
  if (typeof m.name === "string") existing.add(m.name);
}

const files = (await readdir(samplesDir)).filter((f) => /\.(png|jpe?g|webp|mp4)$/i.test(f)).sort();
for (const file of files) {
  if (existing.has(file)) {
    console.log(`  ${file} is already in the playlist.`);
    continue;
  }
  const isPromo = file.startsWith("promo-");
  const tags = isPromo ? [config.promoTag] : [];
  const { result } = await call(`media.uploadFile("${file}")`, () =>
    client.media.uploadFile(join(samplesDir, file), { playlist: playlistId, duration: 8, tags }),
  );
  console.log(`  uploaded ${file}${isPromo ? ` (tagged "${config.promoTag}")` : ""} → ${result.id}`);
}

try {
  await call(`displays.pushContentByTag("${config.screenTag}")`, () =>
    client.displays.pushContentByTag(config.screenTag, { sourceID: playlistId, type: "playlist" }),
  );
  console.log(`\nPlaylist assigned to the screens tagged "${config.screenTag}".`);
} catch (err) {
  const code = codeOf(err);
  if (code === "publish_no_players") {
    console.log(`\nNo screens are tagged "${config.screenTag}" yet. Tag one in the CMS and run setup again.`);
  } else {
    throw err;
  }
}

console.log(`
Before recording, check:
  • The account is on a Premium or Enterprise plan (API keys and tag publishing).
  • The API key has media, playlists and displays permissions.
  • 1–2 screens (or browser players) are tagged "${config.screenTag}".
  • Run "npm run reset" so the promo starts OFF, then "npm run dev".
`);
