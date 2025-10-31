/* eslint-env node */
import { config } from "dotenv";
import express, { type Request, type Response } from "express";
import { verify, settle } from "x402/facilitator";
import {
  PaymentRequirementsSchema,
  PaymentPayloadSchema,
  createConnectedClient,
  createSigner,
  SupportedEVMNetworks
} from "x402/types";

config();

const FACILITATOR_PRIVATE_KEY = process.env.FACILITATOR_PRIVATE_KEY!;
const FACILITATOR_PORT = process.env.FACILITATOR_PORT!;


const app = express();
app.use(express.json());

app.get("/supported", (_req, res) => {
  res.json({
    kinds: [
      {
        x402Version: 1,
        scheme: "exact",
        network: "peaq",
      },
    ],
  });
});

app.post("/verify", async (req: Request, res: Response) => {
  try {
    const paymentRequirements = PaymentRequirementsSchema.parse(req.body.paymentRequirements);
    const paymentPayload = PaymentPayloadSchema.parse(req.body.paymentPayload);

    if (!SupportedEVMNetworks.includes(paymentRequirements.network)) {
      throw new Error("Unsupported network");
    }

    const client = createConnectedClient(paymentRequirements.network);
    const valid = await verify(client, paymentPayload, paymentRequirements);
    res.json(valid);
  } catch (err) {
    console.error("verify error:", err);
    res.status(400).json({ error: "Invalid request" });
  }
});

app.post("/settle", async (req: Request, res: Response) => {
  try {
    const paymentRequirements = PaymentRequirementsSchema.parse(req.body.paymentRequirements);
    const paymentPayload = PaymentPayloadSchema.parse(req.body.paymentPayload);

    if (!SupportedEVMNetworks.includes(paymentRequirements.network)) {
      throw new Error("Unsupported network");
    }

    const signer = await createSigner(paymentRequirements.network, FACILITATOR_PRIVATE_KEY);
    const response = await settle(signer, paymentPayload, paymentRequirements);
    res.json(response);
  } catch (err) {
    console.error("settle error:", err);
    res.status(400).json({ error: "Invalid request" });
  }
});

app.listen(process.env.FACILITATOR_PORT, () => {
  console.log(`Facilitator running at http://localhost:${process.env.FACILITATOR_PORT}`);
});