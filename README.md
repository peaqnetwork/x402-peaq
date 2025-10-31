# Introduction
Use the following guide and repository to be able to:
1. Create a Facilitator.
2. Execute machine-to-machine x402 payments for a privileged data response.
3. Execute human-to-api frontend interaction and trigger x402 payment for a privileged data response.

## Getting Started
```
git clone https://github.com/peaqnetwork/x402-peaq.git
```

```
cd x402-peaq
```

The repository is setup in the following way:
```
x402-peaq/
  facilitator/
  resource-server/
```
The [facilitator](./facilitator/README.md) allows you to run an optional verifier, and the `resource-server` gives examples of [machine-to-machine](./resource-server/machine-to-machine/README.md) and [human-to-api](./resource-server/human-to-api/README.md) `x402` flows.

## Assumptions
In the following examples we assume all participating wallets has native peaq token for gas and USDC/USDT for payment.