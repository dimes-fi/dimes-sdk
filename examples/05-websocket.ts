/**
 * Stream live position events over Socket.IO (Node).
 *
 * `PositionSocket` authenticates with the same JWT as the HTTP client. Give it a
 * `getToken` accessor — here we reuse the `ApiKeyAuth` provider, which caches and
 * refreshes the token. `on("*", …)` subscribes to every event; every `on*` method
 * returns an unsubscribe function.
 *
 * Run:
 *   DIMES_API_KEY=... WALLET_ADDRESS=0x... pnpm tsx examples/05-websocket.ts
 */
import { ApiKeyAuth, DimesClient } from "@dimes-dot-fi/sdk";
import { PositionSocket } from "@dimes-dot-fi/sdk/ws";

const auth = new ApiKeyAuth({
  apiKey: process.env.DIMES_API_KEY ?? "dm_live_skey_xxx",
  walletAddress: process.env.WALLET_ADDRESS ?? "0x0000000000000000000000000000000000000000",
});

// The client isn't required to stream, but it's how you'd act on events.
const client = new DimesClient({ baseUrl: process.env.DIMES_BASE_URL ?? "https://api.dimes.fi", auth });

async function main(): Promise<void> {
  // Prime the JWT so the socket has a token to present on connect.
  await auth.getHeaders();

  const socket = new PositionSocket({
    baseUrl: process.env.DIMES_BASE_URL ?? "https://api.dimes.fi",
    getToken: () => auth.getToken(),
  });

  socket.onConnect(() => console.log("connected"));
  socket.onDisconnect(() => console.log("disconnected"));

  socket.on("*", (event) => {
    console.log(`${event.type} @ ${event.createdAt} — position ${event.data.id}`);
  });

  socket.onNotification((event) => {
    console.log(`notification [${event.data.code}]: ${event.data.message}`);
  });

  socket.connect();
  console.log(`Streaming position events for ${client.baseUrl}. Ctrl-C to exit.`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
