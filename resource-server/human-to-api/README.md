# Introduction
This is an example how a human using MetaMask could request an API with x402 on peaq. It is used as a development PoC and 
is not recommended to be used in production environments.


## Execute Workflow
### 1. Ensure proper directory
```
cd resource-server/human-to-api
```

### 2. Install Dependencies
```
npm install
```
### 3. Environment Setup
Rename `.env.example` to .env and replace the variables with the proper values:
```
FACILITATOR_URL=''
DATA_PROVIDER_ADDRESS=''
SERVER_PORT=4121
```
`FACILITATOR_URL` = The Facilitator URL hosted locally or found [here](https://www.x402.org/ecosystem?category=facilitators).

`DATA_PROVIDER_ADDRESS` = Data Provider who controls the API endpoint who will receive user payment.

`SERVER_PORT` = PORT of the server where the Data Provider hosts their purchasable data.

### 4. Build Frontend
Whenever you make a changes inside the frontend folder, or you **run the script for the first time** execute:
```
npx vite build --config frontend/vite.config.ts
```

### 5. Start Frontend and Server:
If you are hosting a local facilitator make sure to have it running. Next, open up a new terminal and start the server with:
```
npm start
```

`ctrl/cmd+click` on the link the server outputs to interact with the frontend.