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
export declare function retrieveArweaveIdV1fromAddress(address: string, arweaveInstance: IArweave): Promise<ArweaveId | string>;
export declare function setArweaveData(arweaveIdData: ArweaveId, jwk: JWKInterface, arweaveInstance: IArweave): Promise<string>;
