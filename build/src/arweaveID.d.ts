import IArweave from './types/IArweave';
import { JWKInterface } from './types/JwkInterface';
export interface ArweaveId {
    name: string;
    email?: string;
    ethereum?: string;
    twitter?: string;
    discord?: string;
    avatarDataUri?: string;
}
export declare function retrieveArweaveIdFromAddress(address: string, arweaveInstance: IArweave): Promise<ArweaveId>;
export interface ISetReturn {
    txid: string;
    statusCode: number;
    statusMessage: string;
}
export declare function setArweaveData(arweaveIdData: ArweaveId, jwk: JWKInterface, arweaveInstance: IArweave): Promise<ISetReturn>;
export declare function getAddressFromArweaveID(name: string, arweaveInstance: IArweave): Promise<string>;
export declare function getIdenticon(name: string): string;
