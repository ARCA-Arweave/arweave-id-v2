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
	config: ApiConfig
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
	get(field: string): string
	get(field: string, options: { decode: true; string: false; }): Uint8Array
	get(field: string, options: { decode: true; string: true }): string;
}
interface Tag extends BaseObject{
	name: string
	value: string
	// constructor (name: string, value: string, decode?: boolean): Tag
}
interface Transaction extends TransactionInterface, BaseObject {
	// new (attributes?: Partial<TransactionInterface>): Transaction
	addTag(name: string, value: string): void
	toJSON(): {format: number;id: string;last_tx: string;owner: string;tags: Tag[];target: string;quantity: string;data: string;data_size: string;data_root: string;data_tree: string[];reward: string;signature: string;}
	setSignature({ signature, id }: {signature: string;id: string;}): void
	getSignatureData(): Promise<Uint8Array>
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
	// new (api: Api, crypto: CryptoInterface): Transactions
	getTransactionAnchor(): Promise<string>
	getPrice(byteSize: number, targetAddress?: string | undefined): Promise<string>
	get(id: string): Promise<Transaction>
	// fromRaw(attributes: object): Transaction
	// search(tagName: string, tagValue: string): Promise<string[]>
	getStatus(id: string): Promise<TransactionStatusResponse>
	getData(id: string, options?: { decode?: boolean | undefined; string?: boolean | undefined; } | undefined): Promise<string | Uint8Array>
	sign(transaction: Transaction, jwk: JWKInterface): Promise<void>
	verify(transaction: Transaction): Promise<boolean>
	post(transaction: string | object | Transaction | Buffer): Promise<AxiosResponse<any>>
}

interface Wallets {
	ownerToAddress(owner: string): Promise<string>;
}
export default interface IArweave {
	api: Api
	wallets: Wallets
	transactions: Transactions
	// network: Network
	// ar: Ar
	// silo: Silo
	// static init: (apiConfig: ApiConfig) => Arweave
	// static crypto: CryptoInterface
	// static utils = ArweaveUtils

	createTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface): Promise<Transaction>
	createSiloTransaction(attributes: Partial<CreateTransactionInterface>, jwk: JWKInterface, siloUri: string): Promise<Transaction>
	arql(query: object): Promise<string[]>
}



