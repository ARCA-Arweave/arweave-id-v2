"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identiconEr = exports.getAddressFromArweaveID = exports.setArweaveData = exports.retrieveArweaveIdFromAddress = void 0;
const axios_1 = __importDefault(require("axios"));
const identicon_js_1 = __importDefault(require("identicon.js"));
const jshashes_1 = require("jshashes");
const toUint8Array = require('base64-to-uint8array');
async function retrieveArweaveIdFromAddress(address, arweaveInstance) {
    let transactions = await getArweaveIDTxnsForAddress(address, arweaveInstance);
    if (transactions.length == 0)
        return { name: '' };
    var id = { name: '' };
    let v2Txns = transactions.filter(txn => txn.tags.filter(tag => tag['value'] === '0.0.2').length > 0);
    let v1Txns = transactions.filter(txn => txn.tags.filter(tag => tag['value'] === '0.0.1').length > 0);
    // If a V2 ID is found, populate the ArweaveID tags based on the v2 transaction
    if (v2Txns.length > 0) {
        let nameTxn = v2Txns[0];
        // Find correct ArweaveID based on getAddressFromArweaveID rules
        for (var j = 1; j < v2Txns.length; j++) {
            if (address != await getAddressFromArweaveID(nameTxn.tags.filter(tag => tag['name'] == 'Name')[0]['value'], arweaveInstance)) {
                nameTxn = v2Txns[j]; //Work backwards through the list of name transactions to exclude any made for a name already owned by another address
            }
            else {
                console.log(`name transaction == ${nameTxn.id}`);
                break;
            }
        }
        let encodedAvatarData = await arweaveInstance.transactions.getData(nameTxn.id, { decode: true });
        let decodedAvatarData = arweaveInstance.utils.bufferTob64(encodedAvatarData);
        let contentType = '';
        for (var j = 0; j < nameTxn.tags.length; j++) {
            let tag = nameTxn.tags[j];
            switch (tag['name']) {
                case 'Name':
                    id.name = tag['value'];
                    break;
                case 'Email':
                    id.email = tag['value'];
                    break;
                case 'Ethereum':
                    id.ethereum = tag['value'];
                    break;
                case 'Twitter':
                    id.twitter = tag['value'];
                    break;
                case 'Discord':
                    id.discord = tag['value'];
                    break;
                case 'Content-Type':
                    contentType = tag['value'];
                    id.avatarDataUri = `data:${contentType};base64,${decodedAvatarData}`;
                    break;
                default:
            }
        }
    }
    else { //If no V2 ID is found, find the most recent V1 name transaction
        let v1NameTxns = v1Txns.filter(txn => txn.tags.filter(tag => tag['value'] === 'name').length > 0);
        if (v1NameTxns.length > 0) {
            id.name = await arweaveInstance.transactions.getData(v1NameTxns[0].id, { decode: true, string: true });
        }
        // If no name field set, set name equal to Arweave address as default
        else
            id.name = address;
    }
    // Check to see if any elements are not populated and then check to see if there are any V1 transactions corresponding to that element
    if (id.email == undefined) {
        let v1EmailTxns = v1Txns.filter(txn => txn.tags.filter(tag => tag['value'] === 'email').length > 0);
        if (v1EmailTxns.length > 0) {
            id.email = await arweaveInstance.transactions.getData(v1EmailTxns[0].id, { decode: true, string: true });
        }
    }
    if (id.ethereum == undefined) {
        let v1EthTxns = v1Txns.filter(txn => txn.tags.filter(tag => tag['value'] === 'ethereum').length > 0);
        if (v1EthTxns.length > 0) {
            id.ethereum = await arweaveInstance.transactions.getData(v1EthTxns[0].id, { decode: true, string: true });
        }
    }
    if (id.twitter == undefined) {
        let v1TwitterTxns = v1Txns.filter(txn => txn.tags.filter(tag => tag['value'] === 'twitter').length > 0);
        if (v1TwitterTxns.length > 0) {
            id.twitter = await arweaveInstance.transactions.getData(v1TwitterTxns[0].id, { decode: true, string: true });
        }
    }
    if (id.discord == undefined) {
        let v1DiscordTxns = v1Txns.filter(txn => txn.tags.filter(tag => tag['value'] === 'discord').length > 0);
        if (v1DiscordTxns.length > 0) {
            id.discord = await arweaveInstance.transactions.getData(v1DiscordTxns[0].id, { decode: true, string: true });
        }
    }
    return id;
}
exports.retrieveArweaveIdFromAddress = retrieveArweaveIdFromAddress;
async function setArweaveData(arweaveIdData, jwk, arweaveInstance) {
    var _a;
    var mediaType;
    var avatarData;
    switch ((_a = arweaveIdData.avatarDataUri) === null || _a === void 0 ? void 0 : _a.split(':')[0]) {
        // If dataURI format, check for optional media type or note unknown
        case 'data':
            let imgData = arweaveIdData.avatarDataUri.split(',')[1];
            avatarData = toUint8Array(imgData);
            mediaType = arweaveIdData.avatarDataUri.split(';')[0].split(':')[1];
            break;
        // If URL is detected, throw error
        case 'http':
        case 'https':
            throw ('Remote images not supported');
        // If no URI provided, insert '0' in data field so transaction can be submitted
        case undefined:
            mediaType = 'image/png';
            avatarData = toUint8Array('0');
            break;
        default:
            // If provided URI is not valid, insert '0' in data field so transaction can be submitted
            mediaType = 'image/png';
            avatarData = toUint8Array('0');
    }
    console.log('Media Type is ' + mediaType);
    let transaction = await arweaveInstance.createTransaction({ data: avatarData }, jwk);
    transaction.addTag('App-Name', 'arweave-id');
    transaction.addTag('App-Version', '0.0.2');
    transaction.addTag('Name', arweaveIdData.name.trim());
    transaction.addTag('Content-Type', mediaType);
    // Set additional fields if present on ArweaveID instance that is passed
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
    //const res = await arweaveInstance.transactions.post(transaction)
    //return { 'txID': transaction.id, 'status_code': res.status, 'status_message': res.statusText };
}
exports.setArweaveData = setArweaveData;
async function getAddressFromArweaveID(arweaveID, arweaveInstance) {
    const query = `query { transactions(tags: [{name:"App-Name", value:"arweave-id"}, {name:"Name", value:"${arweaveID}"}]) {id tags{name value}}}`;
    const res = await axios_1.default
        .post(`${arweaveInstance.api.config.protocol}://${arweaveInstance.api.config.host}:${arweaveInstance.api.config.port}/arql`, { query: query });
    let arweaveIDTxns = res.data.data.transactions; // Gets all transactions that claim 'arweaveID' 
    /*
    if (arweaveIDTxns.length > 0){
        var nameTxn = await arweaveInstance.transactions.get(arweaveIDTxns[arweaveIDTxns.length-1].id)  //Set owning transaction as earliest transaction by earliest blocktime
        do {
        var owner = await arweaveInstance.wallets.ownerToAddress(nameTxn.owner);
        let ownerTxns = await getArweaveIDTxnsForAddress(owner, arweaveInstance);
        let ownerNameChanges = ownerTxns.filter(txn => txn.tags.filter(tag => tag['type'] === 'Name' && tag['value'] !== arweaveID).length > 0)
        if (ownerNameChanges.length == 0) return owner;  // If oldest claimant has never changed to another name, owner is found
        let ownerNameChangeTxnIndex = ownerTxns.findIndex(txn => txn.id == ownerNameChanges[ownerNameChanges.length-1].id)
        var j = arweaveIDTxns.length-1
        do{
            arweaveIDTxns.pop();		//Remove all name changes from oldest to newest up to when owner released name
            j--;
        } while (arweaveIDTxns[j].id != ownerTxns[ownerNameChangeTxnIndex+1].id)
        arweaveIDTxns.pop();			//Remove previous owner's claim
        var nameTxn = await arweaveInstance.transactions.get(arweaveIDTxns[arweaveIDTxns.length-1].id) // Set owning transaction to remaining earliest transaction
        } while (true);
    }*/
    if (arweaveIDTxns.length > 0) {
        let nameTxn = await arweaveInstance.transactions.get(arweaveIDTxns[arweaveIDTxns.length - 1].id);
        return await arweaveInstance.wallets.ownerToAddress(nameTxn.owner);
    }
    return '';
}
exports.getAddressFromArweaveID = getAddressFromArweaveID;
async function getArweaveIDTxnsForAddress(address, arweaveInstance) {
    var query = `query { transactions(from:["${address}"],tags: [{name:"App-Name", value:"arweave-id"}]) {id tags{name value}}}`;
    let res = await axios_1.default
        .post(`${arweaveInstance.api.config.protocol}://${arweaveInstance.api.config.host}:${arweaveInstance.api.config.port}/arql`, { query: query });
    return res.data.data.transactions;
}
function identiconEr(name) {
    const hash = new jshashes_1.SHA256;
    let identiconString = new identicon_js_1.default(hash.hex(name)).toString();
    return `data:image/png;base64,${identiconString}`;
}
exports.identiconEr = identiconEr;
//# sourceMappingURL=arweaveID.js.map