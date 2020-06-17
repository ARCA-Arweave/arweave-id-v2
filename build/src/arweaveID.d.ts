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
export declare function retrieveArweaveIdfromAddress(address: string, arweaveInstance: IArweave): Promise<ArweaveId>;
export declare function setArweaveData(arweaveIdData: ArweaveId, jwk: JWKInterface, arweaveInstance: IArweave): Promise<string>;
export declare function getAddressfromArweaveID(arweaveID: string, arweaveInstance: IArweave): Promise<string>;
