# Introduction
The following repository has been setup to allow for Machine A to execute an x402 payment for autonomous data access provided by Machine B. 
1. Machine B will create a server where they host their data.
2. Machine A & B will be initialized with on-chain identities where Machine B's server x402 endpoint will be stored. 
3. Machine A will automatically pay based on reading Machine B's known DID Document where the `serviceEndpoint` is stored.

The next section will give background, and the following will show the execution workflow.

## Background
### Machine B Server
The `/api/server.ts` file defines the protected data service that Machine B runs.
It exposes a `/data` endpoint guarded by x402 Express middleware, which enforces on-chain payment before any data is returned.

### Initialization of Machine Identities
The `/machines/initialize.ts` script creates two decentralized machine identities on peaq.
Machine A is the requester of paid data, and Machine B is the provider.

When executed, it registers both DIDs on-chain and embeds an x402 service entry in Machine B’s DID Document; linking its paywalled endpoint (`/data`) to its identity. This allows Machine A to later resolve Machine B’s DID, discover the serviceEndpoint, and automatically execute an x402 payment for access.

### Machine Data Payment
The `/machines/payment.ts` script enables Machine A to autonomously purchase and access Machine B’s protected data.

It first resolves Machine B’s DID to retrieve the stored x402 serviceEndpoint, then uses x402-fetch with Machine A’s wallet client to execute an on-chain payment and fetch the data in a single call. Upon success, the script logs both the returned data and the settlement details from the blockchain transaction.


## Executable Workflow
### 1. Ensure proper directory
```
cd resource-server/machine-to-machine
```

### 2. Install Dependencies
```
npm install
```

### 3. Environment Setup
Rename `.env.example` to .env and replace the variables with the proper values:
```
FACILITATOR_URL=''
SERVER_PORT=4141

MACHINE_A_ADDRESS=''
MACHINE_A_PRIVATE_KEY=''
MACHINE_B_ADDRESS=''
MACHINE_B_PRIVATE_KEY=''

HTTPS_BASE_URL='https://quicknode2.peaq.xyz'
WSS_BASE_URL='wss://quicknode2.peaq.xyz'
```
`FACILITATOR_URL` = The Facilitator URL hosted locally or found [here](https://www.x402.org/ecosystem?category=facilitators).

`SERVER_PORT` = PORT of the server where Machine B hosts their buyable data.

`MACHINE_A_ADDRESS` = Public address of Machine A who will transfer tokens to receive Machine B's data.

`MACHINE_A_PRIVATE_KEY` = Private key of Machine A used to create identity and authorize transfer.

`MACHINE_B_ADDRESS` = Public address of Machine B who will receive to payment.

`MACHINE_B_PRIVATE_KEY` = Private key of Machine B used to create identity and link data service endpoint.

`HTTPS_BASE_URL` = RPC URL for peaq used in SDK initialization

`WSS_BASE_URL` = WSS URL for peaq used in DID reads

### 4. Start Server
If you are hosting a local facilitator make sure to have it running. Next, open up a new terminal and start the server with:
```
npm run server
```

### 5. Initialize Machine Identities
Keep the server running. Open up a new terminal and run:
```
npm run initialize
```

### 6. Machine A pays Machine B for data
Continue to have the server running. Initiate payment from Machine A to Machine B for data.
```
npm run payment
```
Be careful! The payment will happen autonomously. That is why we read the url from a DID Document of a provider we trust. A max amount is 
configurable in the `wrapFetchWithPayment()` function of `machines/payment.ts` in atomic units.