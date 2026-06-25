/**
 * List positions and request an on-chain close (EOA path).
 *
 * `getPositions` returns a discriminated union of open and closed positions; the
 * `isOpenPosition` / `isClosedPosition` guards narrow the type. To close, call the
 * vault's `requestClose` with the position's `onChainPositionKey`.
 *
 * Run:
 *   DIMES_API_KEY=... PRIVATE_KEY=0x... pnpm tsx examples/04-positions-and-close.ts
 */
import { ApiKeyAuth, DimesClient, isOpenPosition } from "@dimes-dot-fi/sdk";
import { buildRequestCloseTx } from "@dimes-dot-fi/sdk/contract";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

const account = privateKeyToAccount((process.env.PRIVATE_KEY ?? `0x${"0".repeat(64)}`) as `0x${string}`);
const wallet = createWalletClient({ account, chain: polygon, transport: http(process.env.RPC_URL) }).extend(
  publicActions,
);
const client = new DimesClient({
  baseUrl: process.env.DIMES_BASE_URL ?? "https://api.dimes.fi",
  auth: new ApiKeyAuth({ apiKey: process.env.DIMES_API_KEY ?? "dm_live_skey_xxx", walletAddress: account.address }),
});

async function main(): Promise<void> {
  const positions = await client.getPositions({ status: "open" });

  for (const position of positions) {
    if (isOpenPosition(position)) {
      console.log(`${position.id} ${position.marketTicker} ${position.side} — ${position.status}`);
    }
  }

  const open = positions.find(isOpenPosition);
  if (!open) {
    console.log("No open positions to close.");
    return;
  }

  const contractInfo = await client.getContractInfo();
  const closeTx = buildRequestCloseTx(
    contractInfo.polygonVaultContractAddress as `0x${string}`,
    open.onChainPositionKey as `0x${string}`,
  );
  const hash = await wallet.writeContract(closeTx);
  console.log("Close requested:", hash);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
