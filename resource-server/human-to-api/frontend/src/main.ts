// frontend/src/main.ts
import { createWalletClient, custom } from "viem";
import { peaq } from "viem/chains";
import { wrapFetchWithPayment } from "x402-fetch";

declare global { interface Window { ethereum?: any } }


async function ensureWalletClient() {
  const provider = window.ethereum;
  if (!provider) throw new Error("No injected wallet found. Install MetaMask or use WalletConnect.");

  const [address] = await provider.request({ method: "eth_requestAccounts" });

  const targetChainHex = `0x${peaq.id.toString(16)}`;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetChainHex }] });
  } catch (err: any) {
    if (err?.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: targetChainHex,
          chainName: peaq.name,
          nativeCurrency: peaq.nativeCurrency,
          rpcUrls: peaq.rpcUrls.default.http,
        }],
      });
    } else {
      throw err;
    }
  }

  return createWalletClient({
    account: address as `0x${string}`,
    chain: peaq,
    transport: custom(provider),
  });
}

async function fetchWithPayment(path: string) {
  const client = await ensureWalletClient();
  const fetchWithPay = wrapFetchWithPayment(fetch, client as any);
  const res = await fetchWithPay(path, {
    method: "GET",
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const paymentResponseHeader = res.headers.get("X-PAYMENT-RESPONSE");
  if (!paymentResponseHeader) throw new Error("No payment response header");
  const settlement = JSON.parse(atob(paymentResponseHeader));
  return { data: await res.json(), settlement };
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("data-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      const { data, settlement } = await fetchWithPayment("/data");
      log("API RESULT:", data); 
      log("\nX-PAYMENT-RESPONSE:", settlement); 
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Error");
    }
  });
});



// log to screen
const logEl   = document.getElementById("log");

function log(...args: any[]) {
  const line = args
    .map((x) => {
      if (typeof x === "string") return x;
      if (typeof x === "bigint") return x.toString();
      try {
        return safeStringify(x);
      } catch {
        return String(x);
      }
    })
    .join(" ");

  logEl!.textContent += line + "\n";
}

function safeStringify(value: any) {
  return JSON.stringify(value, (_, v) =>
    typeof v === "bigint" ? v.toString() : v
  );
}