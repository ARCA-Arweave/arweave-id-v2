/// <reference types="node" />
/**
 * Arweave interface based on Arweave class from arweave-js v1.7.1
 */
import { JWKInterface } from './JwkInterface';
import { AxiosResponse, AxiosRequestConfig, AxiosInstance } from 'axios';
interface ApiConfig {
    host?: string;
    protocol?: string;
    port?: string | number;
    timeout?: number;
    logging?: boolean;
    logger?: Function;
}
interface Api {
    config: ApiConfig;
    applyConfig(config: ApiConfig): void;
    getConfig(): ApiConfig;
    get(endpoint: string, config?: AxiosRequestConfig | undefined): Promise<AxiosResponse>;
    post(endpoint: string, body: Buffer | string | object, config?: AxiosRequestConfig | undefined): Promise<AxiosResponse>;
    request(): AxiosInstance;
}
interface CreateTransactionInterface {
    format: number;
    last_tx: string;
    owner: string;
    tags: Tag[];
    target: string;
    quantity: string;
    data: string | Uint8Array;
    data_size: string;
    data_root?: string;
    reward: string;
}
interface TransactionInterface {
    format: number;
    id: string;
    last_tx: string;
    owner: string;
    tags: Tag[];
    target: string;
    quantity: string;
    data: string;
    reward: string;
    signature: string;
    data_size: string;
    data_root: string;
    data_tree: string[];
}
interface BaseObject {
    get(field: string): string;
    get(field: string, options: {
        decode: true;
        string: false;
    }): Uint8Array;
    get(field: string, options: {
        decode: true;
        string: true;
    }): string;
}
interface Tag extends BaseObject {
    name: string;
    value: string;
}
interface Transaction extends TransactionInterface, BaseObject {
    addTag(name: string, value: string): void;
    toJSON(): {
        format: number;
        id: string;
        last_tx: string;
        owner: string;
        tags: Tag[];
        target: string;
        quantity: string;
        data: string;
        data_size: string;
        data_root: string;
        data_tree: string[];
        reward: string;
        signature: string;
    };
    setSignature({ signature, id }: {
        signature: string;
        id: string;
    }): void;
    getSignatureData(): Promise<Uint8Array>;
}
interface TransactionConfirmedData {
    block_indep_hash: string;
    block_height: number;
    number_of_confirmations: number;
}
interface TransactionStatusResponse {
    status: number;
    confirmed: TransactionConfirmedData | null;
}
interface Transactions {
    getTransactionAnchor(): Promise<string>;
    getPrice(byteSize: number, targetAddress?: string | undefined): Promise<string>;
    get(id: string): Promise<Transaction>;
    getStatus(id: string): Promise<TransactionStatusResponse>;
    getData(id: string, options?: {
        decode?: boolean | undefined;
        string?: boolean | undefined;
    } | undefined): Promise<string | Uint8Array>;
    sign(transaction: Transaction, jwk: JWKInterface): Promise<void>;
    verify(transaction: Transaction): Promise<boolean>;
    post(transaction: string | object | Transaction | Buffer): Promise<AxiosResponse<any>>;
}
interface Wallets {
    ownerToAddress(owner: string): Promise<string>;
}
interface ArweaveUtils {
    concatBuffers(buffers: Uint8Array[] | ArrayBuffer[]): Uint8Array;
    b64UrlToString(b64UrlString: string): string;
    bufferToString(buffer: Uint8Array | ArrayBuffer): string;
    stringToBuffer(string: string): Uint8Array;
    stringToB64Url(string: string): string;
    b64UrlToBuffer(b64UrlString: string): Uint8Array;
    bufferTob64(buffer: Uint8Array): string;
    bufferTob64Url(buffer: Uint8Array): string;
    b64UrlEncode(b64UrlString: string): string;
    b64UrlDecode(b64UrlString: string): string;
}
interface CryptoInterface {
    generateJWK(): Promise<JWKInterface>;
    sign(jwk: JWKInterface, data: Uint8Array): Promise<Uint8Array>;
    verify(publicModulus: string, data: Uint8Array, signature: Uint8Array): Promise<boolean>;
    encrypt(data: Uint8Array, key: string | Uint8Array): Promise<Uint8Array>;
    decrypt(encrypted: Uint8Array, key: string | Uint8Array): Promise<Uint8Array>;
    hash(data: Uint8Array, algorithm?: string): Promise<Uint8Array>;
}
export default interface IArweave {
    api: Api;
    wallets: Wallets;
    transactions: Transactions;
    crypto: CryptoInterface;
    utils: ArweaveUtils;
    createTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface): Promise<Transaction>;
    createSiloTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface, siloUri: string): Promise<Transaction>;
    arql(query: object): Promise<string[]>;
}
export {};
