import { config } from "dotenv";
import { Sdk } from "@peaq-network/sdk";

config();

const HTTPS_BASE_URL = process.env.HTTPS_BASE_URL!;
const WSS_BASE_URL = process.env.WSS_BASE_URL!;
const MACHINE_A_ADDRESS = process.env.MACHINE_A_ADDRESS!;
const MACHINE_A_PRIVATE = process.env.MACHINE_A_PRIVATE_KEY!;
const MACHINE_B_ADDRESS = process.env.MACHINE_B_ADDRESS!;
const MACHINE_B_PRIVATE = process.env.MACHINE_B_PRIVATE_KEY!;

const SERVICE_ENDPOINT = `http://localhost:${process.env.SERVER_PORT}/data`;


async function main() {
    const sdk = await Sdk.createInstance({
        baseUrl: HTTPS_BASE_URL,
        chainType: Sdk.ChainType.EVM
    });
  
    // Create Machine A identity (simple)
    const machineA = "Machine A";
    const tx1 = await sdk.did.create({name: machineA, address: MACHINE_A_ADDRESS, customDocumentFields: {
        verifications: [{
            type: "EcdsaSecp256k1RecoveryMethod2020"
        }]
    }});
    // Send Machine A transaction from Machine A wallet
    const receipt = await Sdk.sendEvmTx({
        tx: tx1,
        baseUrl: HTTPS_BASE_URL,
        seed: MACHINE_A_PRIVATE
    });

    const machineB = "Machine B";
    // Create Machine B identity (link known x402 endpoint)
    const tx2 = await sdk.did.create({name: machineB, address: MACHINE_B_ADDRESS, customDocumentFields: {
        verifications: [{
            type: "EcdsaSecp256k1RecoveryMethod2020"
        }],
        services: [{
            id: "#data-provider",
            type: "x402",
            serviceEndpoint: SERVICE_ENDPOINT // Make sure it matches link defined in api/server.ts
        }]
    }});
    // Send Machine B transaction from Machine B wallet
    const receipt2 = await Sdk.sendEvmTx({
        tx: tx2,
        baseUrl: HTTPS_BASE_URL,
        seed: MACHINE_B_PRIVATE
    });

    // Read the Identities just created then log their DIDs
    const document = await sdk.did.read({
        name: machineA,
        address: MACHINE_A_ADDRESS,
        wssBaseUrl: WSS_BASE_URL
      });

    const document2 = await sdk.did.read({
        name: machineB,
        address: MACHINE_B_ADDRESS,
        wssBaseUrl: WSS_BASE_URL
      });

    console.log("Both Machine Identities have been created.\n");
    console.log("Machine A Identity:\n", document?.document);
    console.log("\n\nMachine B Identity:\n", document2?.document);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});