import IArweave from './types/IArweave';
import { JWKInterface } from './types/JwkInterface';
export interface ArweaveId {
    name: string;
    url?: string;
    text?: string;
    avatarDataUri?: string;
}
/**
 * Function to get an ArweaveId object for the supplied arweave address.
 * @param address user's wallet address to look up
 * @param arweaveInstance an instance of the Arweave object
 */
export declare function get(address: string, arweaveInstance: IArweave): Promise<ArweaveId>;
export interface ISetReturn {
    txid: string;
    statusCode: number;
    statusMessage: string;
}
/**
 * Function to write a new/updated ArweaveId object
 * @param arweaveIdData the arweave-id data to write
 * @param jwk the user's wallet to pay for the transaction
 * @param arweaveInstance an instance of the Arweave object
 */
export declare function set(arweaveIdData: ArweaveId, jwk: JWKInterface, arweaveInstance: IArweave): Promise<ISetReturn>;
/**
 * Checks whether a name is aleady in use. Respects App-Version: 0.0.1 names set before date XXXX-XX-XX
 * @param name arweave-id name to search
 * @param arweaveInstance instance of arweave
 */
export declare function check(name: string, arweaveInstance: IArweave): Promise<string>;
/**
 * Generate an avatar image from a username. For example, can be used as a fallback for when no image is supplied.
 * @param name arweave-id name to turn into an identicon avatar
 */
export declare function getIdenticon(name: string): string;
