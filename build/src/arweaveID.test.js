"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ArweaveID = __importStar(require("./arweaveID"));
const node_1 = __importDefault(require("arweave/node"));
const jwk_json_1 = __importDefault(require("./secrets/jwk.json"));
describe('Test arweaveID.ts functions', () => {
    const arweave = node_1.default.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
    });
    it('retrieveArweaveIdV1fromAddress gets a wallet\'s name', async () => {
        expect(1);
        let res = await ArweaveID.retrieveArweaveIdV1fromAddress('v2XXwq_FvVqH2KR4p_x8H-SQ7rDwZBbykSv-59__Avc', arweave);
        expect(res).toEqual({ "name": "RosMcMahon" });
    });
    it('setArweaveData returns a new transaction id', async () => {
        expect(1);
        let aridData = {
            name: 'RosMcMahon'
        };
        let res = await ArweaveID.setArweaveData(aridData, jwk_json_1.default, arweave);
        expect(res).toMatch(/\S{43}/); //<= I am just testing for a string 43 characters long here
    });
});
//# sourceMappingURL=arweaveID.test.js.map