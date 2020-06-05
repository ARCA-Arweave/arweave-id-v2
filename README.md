# arweave-id-v2

## Usage

### ArweaveId interface

```javascript
ArweaveId {
    name: string //Arweave ID
    email?: string  //email address
    ethereum?: string // Ethereum address
    twitter?: string //twitter handle
    discord?: string //Discord nickname
    avatarDataUri?: string //A dataURI representing the avatar of the user
}
```
### `retrieveArweaveIdV1fromAddress(address: string, arweaveInstance: Arweave): Promise<ArweaveId | string>`

**Parameters**
1. `address` - `string`: a string representing an Arweave address
2. `arweaveInstance` - `Arweave`: an `arweave` object generated from the [`arweave` package](https://www.npmjs.com/package/arweave)

**Returns**
`Promise` that resolves to:
1. An `ArweaveId`interface object representing the ArweaveID attributes associated with the `address` 
2. A `string` message representing an error when trying to retrieve the ArweaveID for a given address

### `setArweaveData(arweaveIdData: ArweaveId, jwk: string, arweaveInstance: Arweave ): Promise<string>`

**Parameters**
1. `arweaveIdData` - `ArweaveId`: an `ArweaveId` object with values corresponding to the Arweave ID elements to be posted to Arweave
2. `jwk` - `string`: a JSON string represeting a private key in [JWK](https://docs.arweave.org/developers/server/http-api#key-format) format
3. `arweaveInstance` - `Arweave`: an `arweave` object generated from the [`arweave` package](https://www.npmjs.com/package/arweave)