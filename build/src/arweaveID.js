"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setArweaveData = exports.retrieveArweaveIdV1fromAddress = void 0;
const axios_1 = __importDefault(require("axios"));
const toUint8Array = require('base64-to-uint8array');
async function retrieveArweaveIdV1fromAddress(address, arweaveInstance) {
    var query = `query { transactions(from:["${address}"],tags: [{name:"App-Name", value:"arweave-id"},{name:"Type", value:"name"}]) {id}}`;
    return axios_1.default
        .post(`${arweaveInstance.api.config.protocol}://${arweaveInstance.api.config.host}:${arweaveInstance.api.config.port}/arql`, { query: query })
        .then(function (res) {
        return arweaveInstance.transactions.getData(res.data.data.transactions[0].id, { decode: true, string: true });
    })
        .then(function (arweaveName) {
        let id = { name: arweaveName };
        return id;
    })
        .catch(err => `Error: ${err}`);
}
exports.retrieveArweaveIdV1fromAddress = retrieveArweaveIdV1fromAddress;
async function setArweaveData(arweaveIdData, jwk, arweaveInstance) {
    var _a;
    var mediaType;
    var avatarData;
    switch ((_a = arweaveIdData.avatarDataUri) === null || _a === void 0 ? void 0 : _a.split(':')[0]) {
        // If dataURI format, check for optional media type or note unknown
        case 'data':
            mediaType = arweaveIdData.avatarDataUri ? arweaveIdData.avatarDataUri.split(';')[0].split(':')[1] : 'Unknown/type';
            if (arweaveIdData.avatarDataUri.split(';')[1] === 'base64') {
                avatarData = toUint8Array(arweaveIdData.avatarDataUri.split(',')[1]);
            }
            else {
                avatarData = arweaveIdData.avatarDataUri.split(',')[1];
            }
            break;
        // If URL is detected, throw error
        case 'http':
        case 'https':
            throw ('Remote images not supported');
        // TODO: If no URI provided, insert fallback avatar
        case undefined:
            mediaType = 'text/plain';
            avatarData = "Insert identicon here";
            break;
        // If not recognizable format, assume URI is Arweave txn and check for a valid transaction and insert transaction string into data field.
        default:
            let txnStatus = await arweaveInstance.transactions.getStatus(arweaveIdData.avatarDataUri);
            if (txnStatus.status === 200) {
                mediaType = 'arweave/transaction';
                avatarData = arweaveIdData.avatarDataUri;
            }
            // TODO: If provided URI is not valid arweave txn ID, insert fallback avatar
            else {
                mediaType = 'text/plain';
                avatarData = "Insert identicon here";
            }
    }
    let transaction = await arweaveInstance.createTransaction({ data: avatarData }, jwk);
    transaction.addTag('App-Name', 'arweave-id');
    transaction.addTag('App-Version', '0.0.2');
    transaction.addTag('Name', arweaveIdData.name);
    transaction.addTag('Content-Type', mediaType);
    if (arweaveIdData.email !== undefined) {
        transaction.addTag('Email', arweaveIdData.email);
    }
    if (arweaveIdData.ethereum !== undefined) {
        transaction.addTag('Ethereum', arweaveIdData.ethereum);
    }
    if (arweaveIdData.twitter !== undefined) {
        transaction.addTag('Twitter', arweaveIdData.twitter);
    }
    if (arweaveIdData.discord !== undefined) {
        transaction.addTag('Discord', arweaveIdData.discord);
    }
    await arweaveInstance.transactions.sign(transaction, jwk);
    console.log('Transaction verified: ' + await arweaveInstance.transactions.verify(transaction));
    console.log('Transaction id is ' + transaction.id);
    const res = await arweaveInstance.transactions.post(transaction);
    return transaction.id;
}
exports.setArweaveData = setArweaveData;
//# sourceMappingURL=arweaveID.js.map