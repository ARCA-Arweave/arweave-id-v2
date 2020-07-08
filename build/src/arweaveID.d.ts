import IArweave from './types/IArweave';
import { JWKInterface } from './types/JwkInterface';
export interface ArweaveId {
    name: string;
    url?: string;
    text?: string;
    avatarDataUri?: string;
}
export declare function get(address: string, arweaveInstance: IArweave): Promise<ArweaveId>;
export interface ISetReturn {
    txid: string;
    statusCode: number;
    statusMessage: string;
}
export declare function set(arweaveIdData: ArweaveId, jwk: JWKInterface, arweaveInstance: IArweave): Promise<ISetReturn>;
/**
 * Checks whether a name is aleady in use. Respects App-Version: 0.0.1 names set before date XXXX-XX-XX
 * @param name arweave-id name to search
 * @param arweaveInstance instance of arweave
 */
export declare function check(name: string, arweaveInstance: IArweave): Promise<string>;
export declare function getIdenticon(name: string): string;
