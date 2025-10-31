import { config } from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { peaq } from "viem/chains"; // or the chain you use (peaq/custom)
import { wrapFetchWithPayment } from "x402-fetch";
import { Sdk } from "@peaq-network/sdk";

config();

const HTTPS_BASE_URL = process.env.HTTPS_BASE_URL!;
const WSS_BASE_URL = process.env.WSS_BASE_URL!;
const MACHINE_B_ADDRESS = process.env.MACHINE_B_ADDRESS!;

// private key for Machine A that buys data from Machine B using USDC set in the server file
const MACHINE_A_PRIVATE = process.env.MACHINE_A_PRIVATE_KEY!; 


// returns back the stored x402 endpoint for a given machine
async function getUrl(machineName: string){
  const sdk = await Sdk.createInstance({
    baseUrl: HTTPS_BASE_URL,
    chainType: Sdk.ChainType.EVM
});

  const document2 = await sdk.did.read({
    name: machineName,
    address: MACHINE_B_ADDRESS,
    wssBaseUrl: WSS_BASE_URL
  });
  return document2?.document.services[0]?.serviceEndpoint;
}

async function payUrl(url: string){
  // Create a wallet client
  const account = privateKeyToAccount(MACHINE_A_PRIVATE as `0x${string}`);
  const client = createWalletClient({
    account,
    transport: http(),
    chain: peaq,
  });
  // Wrap the fetch function with payment handling
  const fetchWithPay = wrapFetchWithPayment(fetch, client, 200000); // can define maxVaule in 3rd parameter. We set ours as $0.20 USDC
  // Make a request that may require payment
  const response = await fetchWithPay(url, {
    method: "GET",
  });
  const paymentResponseHeader = response.headers.get("X-PAYMENT-RESPONSE");
  if (!paymentResponseHeader) throw new Error("No payment response header");
  const settlement = JSON.parse(atob(paymentResponseHeader));

  const data = await response.json();
  return { data, settlement };
  }


// Make sure both machines have been initialized prior to running this script
async function main() {
  const machineName = "Machine B"; // known machine name

  const url = await getUrl(machineName);
  console.log("\nPayable URL: ", url);
  if (!url) {
    console.error("No endpoint found");
    process.exit(1);
  }

  const { data, settlement } = await payUrl(url);

  // Automatically pay the url and return the data and settlement
  // const { data, settlement } = await payUrl(url, header);
  console.log("\nMachine B data: ", data);
  console.log("\nX-PAYMENT-RESPONSE: ", settlement);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

