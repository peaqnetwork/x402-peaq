# Introduction
The following represents a verifying body in the `x402` flow. Either you can go for **Delegated Verification** from service providers 
noted [here](https://www.x402.org/ecosystem?category=facilitators), or you can perform **Self-Hosted Verification** which is what will be shown in this guide. Either, or, the **resource-server** is clear on where to set the facilitator url in the `.env`.

## Running A Facilitator
### 1. Ensure proper directory
```
cd facilitator
```

### 2. Install Dependencies
```
npm install
```

### 3. Environment Setup
Rename `.env.example` to `.env` and replace the variables with proper values
```
FACILITATOR_PRIVATE_KEY=''
FACILITATOR_PORT=3333
```
`FACILITATOR_PRIVATE_KEY` = The **from** address that executes the authorized transfer on-chain.

`FACILITATOR_PORT` = PORT the facilitator runs at.

### 4. Start Facilitator
```
npm start
```

Now that we have this running we can use this URL to set the `FACILITATOR_URL` in the `.env` files inside of one the **resource-servers**. Your next step is to execute one of the following:
- [Machine-to-Machine](../resource-server/machine-to-machine/README.md)
- [Human-to-API](../resource-server/human-to-api/README.md)