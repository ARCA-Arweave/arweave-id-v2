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
export declare function setArweaveData(arweaveIdData: ArweaveId, jwk: JWKInterface, arweaveInstance: IArweave): Promise<any>;
export declare function getAddressFromArweaveID(arweaveID: string, arweaveInstance: IArweave): Promise<string>;
export declare function identiconEr(name: string): string;
