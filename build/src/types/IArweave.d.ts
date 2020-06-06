/// <reference types="node" />
/**
 * Arweave interface based on Arweave class from arweave-js v1.7.1
 */
import { JWKInterface } from './JwkInterface';
import { AxiosResponse } from 'axios';
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
    getStatus(id: string): Promise<TransactionStatusResponse>;
    getData(id: string, options?: {
        decode?: boolean | undefined;
        string?: boolean | undefined;
    } | undefined): Promise<string | Uint8Array>;
    sign(transaction: Transaction, jwk: JWKInterface): Promise<void>;
    verify(transaction: Transaction): Promise<boolean>;
    post(transaction: string | object | Transaction | Buffer): Promise<AxiosResponse<any>>;
}
export default interface IArweave {
    api: Api;
    transactions: Transactions;
    createTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface): Promise<Transaction>;
    createSiloTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface, siloUri: string): Promise<Transaction>;
    arql(query: object): Promise<string[]>;
}
export {};
