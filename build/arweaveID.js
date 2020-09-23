"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.getIdenticon = exports.check = exports.set = exports.get = void 0;
var identicon_js_1 = __importDefault(require("identicon.js"));
var jshashes_1 = require("jshashes");
var toUint8Array = require('base64-to-uint8array');
var v1claimed_1 = __importDefault(require("./v1claimed"));
var xss_1 = require("xss");
/**
 * Function to get an ArweaveId object for the supplied arweave address.
 * @param address user's wallet address to look up
 * @param arweaveInstance an instance of the Arweave object
 */
function get(address, arweaveInstance) {
    return __awaiter(this, void 0, void 0, function () {
        var transactions, id, v2Txns, v1Txns, nameTxn, j, _a, encodedAvatarData, decodedAvatarData, contentType, j, tag, v1NameTxns, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getArweaveIDTxnsForAddress(address, arweaveInstance)];
                case 1:
                    transactions = _c.sent();
                    if (transactions.length == 0)
                        return [2 /*return*/, { name: '' }];
                    id = { name: '' };
                    v2Txns = transactions.filter(function (txn) { return txn.tags.filter(function (tag) { return tag['value'] === '0.0.2'; }).length > 0; });
                    v1Txns = transactions.filter(function (txn) { return txn.tags.filter(function (tag) { return tag['value'] === '0.0.1'; }).length > 0; });
                    if (!(v2Txns.length > 0)) return [3 /*break*/, 7];
                    nameTxn = v2Txns[0];
                    j = 1;
                    _c.label = 2;
                case 2:
                    if (!(j < v2Txns.length)) return [3 /*break*/, 5];
                    _a = address;
                    return [4 /*yield*/, check(nameTxn.tags.filter(function (tag) { return tag['name'] == 'Name'; })[0]['value'], arweaveInstance)];
                case 3:
                    if (_a != (_c.sent())) {
                        nameTxn = v2Txns[j]; //Work backwards through the list of name transactions to exclude any made for a name already owned by another address
                    }
                    else {
                        console.log("name transaction == " + nameTxn.id);
                        return [3 /*break*/, 5];
                    }
                    _c.label = 4;
                case 4:
                    j++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, arweaveInstance.transactions.getData(nameTxn.id, { decode: true })];
                case 6:
                    encodedAvatarData = _c.sent();
                    decodedAvatarData = xss_1.filterXSS(arweaveInstance.utils.bufferTob64(encodedAvatarData));
                    contentType = '';
                    for (j = 0; j < nameTxn.tags.length; j++) {
                        tag = nameTxn.tags[j];
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
                                    id.avatarDataUri = "data:" + contentType + ";base64," + decodedAvatarData;
                                }
                                break;
                            default:
                        }
                    }
                    return [3 /*break*/, 10];
                case 7:
                    v1NameTxns = v1Txns.filter(function (txn) { return txn.tags.filter(function (tag) { return tag['value'] === 'name'; }).length > 0; });
                    if (!(v1NameTxns.length > 0)) return [3 /*break*/, 9];
                    _b = id;
                    return [4 /*yield*/, arweaveInstance.transactions.getData(v1NameTxns[0].id, { decode: true, string: true })];
                case 8:
                    _b.name = (_c.sent());
                    return [3 /*break*/, 10];
                case 9:
                    id.name = address;
                    _c.label = 10;
                case 10: return [2 /*return*/, id];
            }
        });
    });
}
exports.get = get;
/**
 * Function to write a new/updated ArweaveId object
 * @param arweaveIdData the arweave-id data to write
 * @param jwk the user's wallet to pay for the transaction
 * @param arweaveInstance an instance of the Arweave object
 */
function set(arweaveIdData, jwk, arweaveInstance) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var signingAddress, idOwnerAddress, mediaType, avatarData, meta, transaction, _b, _c, _d, res, status;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, arweaveInstance.wallets.ownerToAddress(jwk.n)];
                case 1:
                    signingAddress = _e.sent();
                    return [4 /*yield*/, check(arweaveIdData.name, arweaveInstance)];
                case 2:
                    idOwnerAddress = _e.sent();
                    if ((idOwnerAddress !== '') && (idOwnerAddress !== signingAddress)) {
                        return [2 /*return*/, { txid: '', statusCode: 400, statusMessage: 'Name already taken' }];
                    }
                    mediaType = '';
                    switch ((_a = arweaveIdData.avatarDataUri) === null || _a === void 0 ? void 0 : _a.split(':')[0]) {
                        // If dataURI format, check for optional media type or note unknown
                        case 'data':
                            // Example dataUri strings:
                            // data:image/jpeg;base64,/9j/2wCEAAMCA...
                            // data:image/png;base64,iVBORw0KGgoAAA...
                            // data:image/gif;base64,R0lGODlhEAAQAM...
                            avatarData = xss_1.filterXSS(arweaveIdData.avatarDataUri.split(',').slice(1).join(',')); //removes first array element of ',' split
                            meta = arweaveIdData.avatarDataUri.split(',')[0];
                            if (meta.split(';')[1]) {
                                console.log('base64 detected');
                                avatarData = toUint8Array(avatarData); //if base64 convert to binary using toUnit8Array(base64string)
                                mediaType = meta.split(';')[0].split(':')[1];
                            }
                            else {
                                mediaType = meta.split(':')[1];
                            }
                            if (mediaType !== 'image/gif' && mediaType !== 'image/png' && mediaType !== 'image/jpeg') {
                                return [2 /*return*/, { txid: '', statusCode: 400, statusMessage: 'Invalid data URI' }];
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
                    return [4 /*yield*/, arweaveInstance.createTransaction({ data: avatarData }, jwk)];
                case 3:
                    transaction = _e.sent();
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
                    return [4 /*yield*/, arweaveInstance.transactions.sign(transaction, jwk)];
                case 4:
                    _e.sent();
                    _c = (_b = console).log;
                    _d = 'Transaction verified: ';
                    return [4 /*yield*/, arweaveInstance.transactions.verify(transaction)];
                case 5:
                    _c.apply(_b, [_d + (_e.sent())]);
                    console.log('Transaction id is ' + transaction.id);
                    return [4 /*yield*/, arweaveInstance.transactions.post(transaction)];
                case 6:
                    res = _e.sent();
                    return [4 /*yield*/, arweaveInstance.transactions.getStatus(transaction.id)];
                case 7:
                    status = _e.sent();
                    return [2 /*return*/, { txid: transaction.id, statusCode: status.status, statusMessage: res.statusText }];
            }
        });
    });
}
exports.set = set;
/**
 * Checks whether a name is aleady in use. Respects App-Version: 0.0.1 names set before date XXXX-XX-XX
 * @param name arweave-id name to search
 * @param arweaveInstance instance of arweave
 */
function check(name, arweaveInstance) {
    return __awaiter(this, void 0, void 0, function () {
        var _name, query, res, arweaveIDTxns, nameTxn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _name = xss_1.filterXSS(name);
                    if (v1claimed_1["default"][_name] !== undefined) {
                        return [2 /*return*/, v1claimed_1["default"][_name]];
                    }
                    query = "query { transactions(tags: [{name:\"App-Name\", value:\"arweave-id\"}, {name:\"Name\", value:\"" + _name + "\"}]) {id tags{name value}}}";
                    return [4 /*yield*/, arweaveInstance.api.post('arql', { query: query })];
                case 1:
                    res = _a.sent();
                    arweaveIDTxns = res.data.data.transactions // Gets all transactions that claim 'arweaveID' 
                    ;
                    if (!(arweaveIDTxns.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, arweaveInstance.transactions.get(arweaveIDTxns[arweaveIDTxns.length - 1].id)];
                case 2:
                    nameTxn = _a.sent();
                    return [4 /*yield*/, arweaveInstance.wallets.ownerToAddress(nameTxn.owner)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [2 /*return*/, ''];
            }
        });
    });
}
exports.check = check;
function getArweaveIDTxnsForAddress(address, arweaveInstance) {
    return __awaiter(this, void 0, void 0, function () {
        var query, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = "query { transactions(from:[\"" + address + "\"],tags: [{name:\"App-Name\", value:\"arweave-id\"}]) {id tags{name value}}}";
                    return [4 /*yield*/, arweaveInstance.api.post('arql', { query: query })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res.data.data.transactions];
            }
        });
    });
}
/**
 * Generate an avatar image from a username. For example, can be used as a fallback for when no image is supplied.
 * @param name arweave-id name to turn into an identicon avatar
 */
function getIdenticon(name) {
    var hash = new jshashes_1.SHA256;
    var identiconString = new identicon_js_1["default"](hash.hex(name)).toString();
    return "data:image/png;base64," + identiconString;
}
exports.getIdenticon = getIdenticon;
