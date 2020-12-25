# walletChain
A centralized cryptocurrency based on wallet chain technology made in TypeScript with Deno

## Run
To run the server: `export PORT=xxxx && deno run --allow-read --allow-env --allow-net src/server.ts`. The default port is `3000`

## Testing
To run the tests: `deno test --allow-net test/*`

## Routes
| method | path           | description |
| ------ | -------------- | ----------- |
| GET    | /newWallet     | create a new wallet and return its `number` and its one time password `uri` |
| POST   | /newBlock      | create a new block, receives a `application/json` body with the required paramenters `oneTimePassword`, `lastHash`, `walletNumber`, `proofNumber`
| POST   | /transferBlock | transfer a block, receives a `application/json` body with the required paramenters `senderOneTimePassword`, `senderWalletNumber`, `receiverWalletNumber`, `blockNumber` |
| GET    | /difficulty    | return the number of 0s on the start of the hash |
| GET    | /lastBlock     | return the `hash` and the `blockNumber` of the last block |