/**
 * Open a position on-chain from an EOA (viem).
 *
 * Flow: quote → approve the vault to pull collateral + fees → verify the quote
 * signature → createPosition. `buildVerifiedCreatePositionTx` recovers the EIP-712
 * signer and checks it against `GET /contract-info` before building the tx, so a
 * tampered or stale quote fails fast in your client instead of reverting on-chain.
 *
 * Polymarket deposit wallets cannot use this approve path — see the deposit-wallet
 * builders (`buildVerifiedPushFundedCreateCalls`, `buildRelayerSubmitPayload`).
 *
 * Run (testnet/sandbox funds only — this sends real transactions):
 *   DIMES_API_KEY=... PRIVATE_KEY=0x... pnpm tsx examples/03-open-position-onchain.ts
 */
import { ApiKeyAuth, DimesClient, executeQuote } from "@dimes-dot-fi/sdk";
import { buildApproveTx, buildVerifiedCreatePositionTx } from "@dimes-dot-fi/sdk/contract";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

const account = privateKeyToAccount((process.env.PRIVATE_KEY ?? `0x${"0".repeat(64)}`) as `0x${string}`);

const wallet = createWalletClient({
  account,
  chain: polygon,
  transport: http(process.env.RPC_URL),
}).extend(publicActions);

const client = new DimesClient({
  baseUrl: process.env.DIMES_BASE_URL ?? "https://api.dimes.fi",
  auth: new ApiKeyAuth({ apiKey: process.env.DIMES_API_KEY ?? "dm_live_skey_xxx", walletAddress: account.address }),
});

async function main(): Promise<void> {
  const { quote } = await executeQuote(client, {
    marketTicker: process.env.MARKET_TICKER ?? "TRUMP-2024-WIN",
    side: "yes",
    collateralUsd: 100,
    leverageBps: 20_000,
    slippageBps: 300,
  });

  // 1. Approve the vault for the full debit (collateral + fees).
  const contractInfo = await client.getContractInfo();
  const approveTx = buildApproveTx(
    contractInfo.polygonUsdcTokenAddress as `0x${string}`,
    quote.polygonVaultContractAddress as `0x${string}`,
    BigInt(quote.totalUserAmountUsdcUnits),
  );
  const approveHash = await wallet.writeContract(approveTx);
  await wallet.waitForTransactionReceipt({ hash: approveHash });
  console.log("Approved:", approveHash);

  // 2. Verify the signature, then open the position.
  const createTx = await buildVerifiedCreatePositionTx(client, quote, account.address);
  const openHash = await wallet.writeContract(createTx);
  console.log("Opened:", openHash);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
