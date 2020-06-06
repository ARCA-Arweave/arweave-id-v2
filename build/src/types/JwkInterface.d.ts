/**
 * Based on types from arweave-js v1.7.1
 */
export interface JWKPublicInterface {
    kty: string;
    e: string;
    n: string;
}
export interface JWKInterface extends JWKPublicInterface {
    d?: string;
    p?: string;
    q?: string;
    dp?: string;
    dq?: string;
    qi?: string;
}
