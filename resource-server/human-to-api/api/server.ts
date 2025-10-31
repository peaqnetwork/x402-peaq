import { config } from "dotenv";
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { paymentMiddleware, type Resource } from "x402-express";

config();

const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
const payTo = process.env.DATA_PROVIDER_ADDRESS as `0x${string}`;
const port = process.env.SERVER_PORT;


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// uses built dist from vite to serve the frontend
const dist = path.resolve(__dirname, "../dist");
app.use(express.static(dist));

// ensures user cannot directly access the endpoint
app.get("/data", (req, res, next) => {
  const wantsHtml = (req.headers.accept || "").includes("text/html");
  const hasXPayment = !!req.headers["x-payment"];
  if (wantsHtml && !hasXPayment) return res.redirect(302, "/");
  next();
});

app.use(
  // USDC payments on peaq
  paymentMiddleware(
    payTo,
    {
      "GET /data": {
        price: "$0.01", // price in USDC; make sure to match with the frontend index.html button price.
        network: "peaq",
      },
    },
    {
      url: facilitatorUrl,
    },
  ),
  // // Uncomment for USDT payments on peaq (make sure to comment out the USDC payment middleware above))
  // paymentMiddleware(
  //   payTo,
  //   {
  //     "GET /data": {
  //       price: {
  //         amount: "10000", // atomic units; make sure to match with the frontend index.html button price.
  //         asset: {
  //           decimals: 6,
  //           address: "0xf4d9235269a96aadafc9adae454a0618ebe37949", // known stgUSDT address on peaq
  //           eip712: {
  //             name: "Bridged stgUSDT",
  //            version: "1",
  //          },
  //         },
  //       },
  //       network: "peaq",
  //     },
  //   },
  //   {
  //     url: facilitatorUrl,
  //   },
  // ),
);

// API endpoint that returns the secret data
app.get("/data", (_req, res) => {
  if (res.locals?.x402?.settlement) {
    const payload = Buffer.from(JSON.stringify(res.locals.x402.settlement)).toString("base64");
    res.setHeader("X-PAYMENT-RESPONSE", payload);
  }
  res.json({ report: { weather: "sunny", temperature: 70 } });
});


// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});