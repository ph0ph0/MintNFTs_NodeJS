const csv = require('csv-parser');
const fs = require('fs');

const fcl = require("@onflow/fcl");
const { config } = fcl;

// NOTE: Imports in BATCH_MINT_ITEMS must be changed to testnet/mainnet addresses
const batch_mint_items = require('./cadence/transactions/batch_mint_items.js');

const processCSV = async () => {
    // Config FCL
    await config().put("accessNode.api", "https://access-testnet.onflow.org");

    // Read CSV
    fs.createReadStream('mock.csv')
    .pipe(csv())
    .on('data', (row) => {
        // Now we have each row, extract each property
      console.log(row);
      let recipientAddr = row.recipientAddr
      let garmentName = row.garmentName
      let royaltyVaultAddr = row.royaltyVaultAddr
      console.log(`${recipientAddr}`)
      console.log(`${garmentName}`)
      console.log(`${royaltyVaultAddr}`)

      // Now construct tx using FCL. args are passed in, in-order, to batch_mint_items.js
      //   Need to authorise tx...
    //   const transactionId = await fcl.mutate({
    //     cadence: batch_mint_items,
    //     args: (arg, t) => [arg(recipientAddr, t.Address), (garmentName, t.String), (royaltyVaultAddr, t.Address)],
    //     payer: fcl.authz,
    //     proposer: fcl.authz,
    //     authorizations: [fcl.authz],
    //     limit: 999
    //   })

    })
    .on('end', () => {
      console.log('CSV file successfully processed');
    })
}

processCSV()