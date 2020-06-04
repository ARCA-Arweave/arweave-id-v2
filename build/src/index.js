"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = __importDefault(require("arweave/node"));
const axios_1 = __importDefault(require("axios"));
const arweave = node_1.default.init({
    host: 'perma.online',
    port: 443,
    protocol: 'https',
});
async function retrieveArweaveIdV1Txns(address) {
    const query = 'query { transactions(from:["bLkyTRJCYg8WxBKrjBwAaRe1H7HYDfXzl7YKCENvw-Q"],tags: [{name:"App-Name", value:"arweave-id"},{name:"Type", value:"name"}]) {id}}';
    return axios_1.default
        .post('https://perma.online:443/arql', { query: query })
        .then(res => arweave.transactions.getData(res.data.data.transactions[0].id, { decode: true, string: true }))
        .then(name => name);
}
retrieveArweaveIdV1Txns().then(res => console.log("Say Cheese" + res));
/*
const query =
  'query { transactions(from:["bLkyTRJCYg8WxBKrjBwAaRe1H7HYDfXzl7YKCENvw-Q"],tags: [{name:"App-Name", value:"arweave-id"},{name:"Type", value:"name"}]) {id}}';
axios
  .post('https://arweave.net:443/arql', { query: query })
  .then(res => console.log(res.data.data.transactions));*/
//# sourceMappingURL=index.js.map