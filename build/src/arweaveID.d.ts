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
export declare function check(name: string, arweaveInstance: IArweave): Promise<string>;
export declare function getIdenticon(name: string): string;
