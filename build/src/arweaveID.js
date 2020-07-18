"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdenticon = exports.check = exports.set = exports.get = void 0;
const identicon_js_1 = __importDefault(require("identicon.js"));
const jshashes_1 = require("jshashes");
const toUint8Array = require('base64-to-uint8array');
const v1claimed_1 = __importDefault(require("./v1claimed"));
const xss_1 = require("xss");
/**
 * Function to get an ArweaveId object for the supplied arweave address.
 * @param address user's wallet address to look up
 * @param arweaveInstance an instance of the Arweave object
 */
async function get(address, arweaveInstance) {
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
            if (address != await check(nameTxn.tags.filter(tag => tag['name'] == 'Name')[0]['value'], arweaveInstance)) {
                nameTxn = v2Txns[j]; //Work backwards through the list of name transactions to exclude any made for a name already owned by another address
            }
            else {
                console.log(`name transaction == ${nameTxn.id}`);
                break;
            }
        }
        let encodedAvatarData = await arweaveInstance.transactions.getData(nameTxn.id, { decode: true });
        let decodedAvatarData = xss_1.filterXSS(arweaveInstance.utils.bufferTob64(encodedAvatarData));
        let contentType = '';
        for (var j = 0; j < nameTxn.tags.length; j++) {
            let tag = nameTxn.tags[j];
            switch (tag['name']) {
                case 'Name':
                    id.name = xss_1.filterXSS(tag['value']);
                    break;
                case 'Url':
                    id.url = xss_1.filterXSS(tag['value']);
                    break;
                case 'Text':
                    id.text = xss_1.filterXSS(tag['value']);
                    break;
                case 'Content-Type':
                    contentType = tag['value'];
                    if (contentType === 'image/gif' || contentType === 'image/png' || contentType === 'image/jpeg') {
                        id.avatarDataUri = `data:${contentType};base64,${decodedAvatarData}`;
                    }
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
    return id;
}
exports.get = get;
/**
 * Function to write a new/updated ArweaveId object
 * @param arweaveIdData the arweave-id data to write
 * @param jwk the user's wallet to pay for the transaction
 * @param arweaveInstance an instance of the Arweave object
 */
async function set(arweaveIdData, jwk, arweaveInstance) {
    var _a;
    /* Verify that submitted name is not already taken */
    let signingAddress = await arweaveInstance.wallets.ownerToAddress(jwk.n);
    let idOwnerAddress = await check(arweaveIdData.name, arweaveInstance);
    if ((idOwnerAddress !== '') && (idOwnerAddress !== signingAddress)) {
        return { txid: '', statusCode: 400, statusMessage: 'Name already taken' };
    }
    /* Handle the dataUri string */
    var mediaType = '';
    var avatarData;
    switch ((_a = arweaveIdData.avatarDataUri) === null || _a === void 0 ? void 0 : _a.split(':')[0]) {
        // If dataURI format, check for optional media type or note unknown
        case 'data':
            // Example dataUri strings:
            // data:image/jpeg;base64,/9j/2wCEAAMCA...
            // data:image/png;base64,iVBORw0KGgoAAA...
            // data:image/gif;base64,R0lGODlhEAAQAM...
            avatarData = xss_1.filterXSS(arweaveIdData.avatarDataUri.split(',').slice(1).join(',')); //removes first array element of ',' split
            let meta = arweaveIdData.avatarDataUri.split(',')[0];
            if (meta.split(';')[1]) {
                console.log('base64 detected');
                avatarData = toUint8Array(avatarData); //if base64 convert to binary using toUnit8Array(base64string)
                mediaType = meta.split(';')[0].split(':')[1];
            }
            else {
                mediaType = meta.split(':')[1];
            }
            if (mediaType !== 'image/gif' && mediaType !== 'image/png' && mediaType !== 'image/jpeg') {
                return { txid: '', statusCode: 400, statusMessage: 'Invalid data URI' };
            }
            break;
        // If URL is detected, throw error
        case 'http':
        case 'https':
            throw ('Remote images not supported');
        // If no URI provided, insert '0' in data field so transaction can be submitted
        case undefined:
            avatarData = '0';
            break;
        default:
            // If provided URI is not valid, insert '0' in data field so transaction can be submitted
            avatarData = '0';
    }
    /* Compose & send the transaction */
    let transaction = await arweaveInstance.createTransaction({ data: avatarData }, jwk);
    transaction.addTag('App-Name', 'arweave-id');
    transaction.addTag('App-Version', '0.0.2');
    transaction.addTag('Name', xss_1.filterXSS(arweaveIdData.name.trim()));
    if ((arweaveIdData.text !== undefined) && (arweaveIdData.text !== '')) {
        transaction.addTag('Text', xss_1.filterXSS(arweaveIdData.text));
    }
    if ((arweaveIdData.url !== undefined) && (arweaveIdData.url !== '')) {
        transaction.addTag('Url', xss_1.filterXSS(arweaveIdData.url));
    }
    mediaType.length === 0 ? mediaType = 'none' : transaction.addTag('Content-Type', mediaType);
    console.log('Media Type is ' + mediaType);
    await arweaveInstance.transactions.sign(transaction, jwk);
    console.log('Transaction verified: ' + await arweaveInstance.transactions.verify(transaction));
    console.log('Transaction id is ' + transaction.id);
    const res = await arweaveInstance.transactions.post(transaction);
    const status = await arweaveInstance.transactions.getStatus(transaction.id);
    return { txid: transaction.id, statusCode: status.status, statusMessage: res.statusText };
}
exports.set = set;
/**
 * Checks whether a name is aleady in use. Respects App-Version: 0.0.1 names set before date XXXX-XX-XX
 * @param name arweave-id name to search
 * @param arweaveInstance instance of arweave
 */
async function check(name, arweaveInstance) {
    let _name = xss_1.filterXSS(name);
    if (v1claimed_1.default[_name] !== undefined) {
        return v1claimed_1.default[_name];
    }
    const query = `query { transactions(tags: [{name:"App-Name", value:"arweave-id"}, {name:"Name", value:"${_name}"}]) {id tags{name value}}}`;
    let res = await arweaveInstance.api.post('arql', { query: query });
    let arweaveIDTxns = res.data.data.transactions; // Gets all transactions that claim 'arweaveID' 
    if (arweaveIDTxns.length > 0) {
        let nameTxn = await arweaveInstance.transactions.get(arweaveIDTxns[arweaveIDTxns.length - 1].id);
        return await arweaveInstance.wallets.ownerToAddress(nameTxn.owner);
    }
    return '';
}
exports.check = check;
async function getArweaveIDTxnsForAddress(address, arweaveInstance) {
    var query = `query { transactions(from:["${address}"],tags: [{name:"App-Name", value:"arweave-id"}]) {id tags{name value}}}`;
    let res = await arweaveInstance.api.post('arql', { query: query });
    console.log(res);
    return res.data.data.transactions;
}
/**
 * Generate an avatar image from a username. For example, can be used as a fallback for when no image is supplied.
 * @param name arweave-id name to turn into an identicon avatar
 */
function getIdenticon(name) {
    const hash = new jshashes_1.SHA256;
    let identiconString = new identicon_js_1.default(hash.hex(name)).toString();
    return `data:image/png;base64,${identiconString}`;
}
exports.getIdenticon = getIdenticon;
//# sourceMappingURL=arweaveID.js.map