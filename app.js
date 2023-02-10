const express = require("express");
const Web3 = require("web3");
const moment = require("moment");
const EthDater = require("ethereum-block-by-date");
// Setup
const { Alchemy, Network } = require("alchemy-sdk");

const settings = {
  apiKey: "qJXNngMpjxiBD6ynFTqDh_fWsU_QKQqp",
  network: Network.ETH_MAINNET,
};

const app = express();
// const http = require("http").Server(app);

const port = process.env.PORT || 8004;

const path = require("path");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
const logger = require("morgan");
// const webSocketComponent = require("./server/api/websocket");
// const routes = require("./server/routes");
// const jwtMiddleware = require("./server/middleware/jwt");

app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(jwtMiddleware);
const alchemy = new Alchemy(settings);

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://eth-mainnet.g.alchemy.com/v2/vgr5QNP-bucZgkpYDG2GYPsdSCdCg8KL"
  )
);
const dater = new EthDater(
  web3 // Web3 object, required.
);

const contractAdress = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
const abi = require("./abi.json");

async function getHolders(contractAddress, startDate, endDate) {
  const startTimestamp = startDate.unix();
  const endTimestamp = endDate.unix();

  const contractBalance = await web3.eth.getBalance(contractAddress);

  console.log(contractBalance, "balance");

  if (contractBalance === 0) {
    return [];
  }

  const holders = [];

  console.log(contractAddress, "contractAdress");

  const _address = await web3.eth.getStorageAt(contractAddress, 0);

  // const count = await web3.eth.abi.decodeParameter("uint", _address);
  const count = await web3.eth.getCode(contractAddress);

  console.log(count, "count");

  console.log(await web3.eth.getStorageAt(contractAddress, 0), "test");

  for (let i = 0; i < count; i++) {
    const holder = await web3.eth.getStorageAt(contractAddress, i + 1);
    // const transaction = await web3.eth.getTransactionByStorageIndex(
    //   contractAddress,
    //   i
    // );
    console.log(holder, "holder");
    holders.push(holder);
    // const block = await web3.eth.getBlock(transaction.blockNumber);

    // if (block.timestamp >= startTimestamp && block.timestamp <= endTimestamp) {
    // }
  }

  return holders;
}

app.use("/api/v1/user/:date", async (req, res) => {
  // let blocks = await dater.getEvery(
  //   "days", // Period, required. Valid value: years, quarters, months, weeks, days, hours, minutes
  //   moment().startOf("day"), // Start date, required. Any valid moment.js value: string, milliseconds, Date() object, moment() object.
  //   moment().endOf("day"), // End date, required. Any valid moment.js value: string, milliseconds, Date() object, moment() object.
  //   1, // Duration, optional, integer. By default 1.
  //   true, // Block after, optional. Search for the nearest block before or after the given date. By default true.
  //   false // Refresh boundaries, optional. Recheck the latest block before request. By default false.
  // );

  // if (blocks < 1) res.send(0);

  // const logs = await web3.eth.getPastLogs({
  //   // fromBlock: blocks[0].block,
  //   // toBlock: blocks[blocks.length - 1].block,
  //   address: contractAdress,
  //   topics: [
  //     "0x033456732123ffff2342342dd12342434324234234fd234fd23fd4f23d4234",
  //   ],
  // });
  // const balance = await web3.eth.getBalance(contractAdress);
  // if (balance <= 0) res.send(0);

  // console.log(balance, "blocks");

  // const holders = [];
  // const hoders = await getHolders(
  //   contractAdress,
  //   moment().startOf("day"),
  //   moment().endOf("day")
  // );
  // console.log(hoders, "holder");
  // Get owners
  const owners = await alchemy.nft.getOwnersForContract(contractAdress, {
    withTokenBalances: true,
    block: moment().unix(),
  });
  console.log(owners.owners);

  const result = owners.owners.reduce((prev, curr) => {
    return (prev += curr.tokenBalances[0].balance);
  }, 0);

  res.send({ total: result });
});

// webSocketComponent(http, app);

app.listen(port, () => {
  console.log(`listening on *:${port}`);
});
