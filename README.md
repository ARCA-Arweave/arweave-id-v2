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
### `get(address: string, arweaveInstance: Arweave): Promise<ArweaveId>`
Looks up the ArweaveID associated with a given Arweave address and returns all available data elements

**Parameters**
1. `address` - `string`: a string representing an Arweave address
2. `arweaveInstance` - `Arweave`: an `arweave` object generated from the [`arweave` package](https://www.npmjs.com/package/arweave)

**Returns**
`Promise` that resolves to an `ArweaveId`interface object representing the ArweaveID attributes associated with the `address` 

### `set(arweaveIdData: ArweaveId, jwk: JWKInterface, arweaveInstance: Arweave ): Promise<ISetReturn>`
Creates, signs, and submits an ArweaveID transaction claiming ownership of the ArweaveID provided.

**Parameters**
1. `arweaveIdData` - `ArweaveId`: an `ArweaveId` object with values corresponding to the Arweave ID elements to be posted to Arweave
2. `jwk` - `JWKInterface`: a JSON object represeting a private key in [JWK](https://docs.arweave.org/developers/server/http-api#key-format) format
3. `arweaveInstance` - `Arweave`: an `arweave` object generated from the [`arweave` package](https://www.npmjs.com/package/arweave)

**Returns**
`Promise` that resolves to an `ISetReturn` object
1. `txid` - `string` - The transaction ID generated for the transaction - will be a blank string if the data can't be posted
2. `statusCode` - `number` - The HTTP status code received back from the Arweave node (e.g. 200 if transaction successfully posted)
3. `statusMessage` - `string` - The status message associated with the HTTP status code response (e.g. 'OK' if transaction successfully posted)

**Notes:**
1. If no `name` property is provided in `arweaveIdData`, the `name` property will be set to the address of the wallet signing the transaction as a default.
2. If no `avatarDataUri` property is provided in `arweaveIdData`, the `data` element of the transaction submitted to Arweave will be set to `'0'`.


### `check(name: string, arweaveInstance: IArweave): Promise<string>`
Looks up an ArweaveID name to see if it's available and returns the owning address if not.

**Parameters**
1. `name` - `string` - The ArweaveID to be looked up
2. `arweaveInstance` - `Arweave`: an `arweave` object generated from the [`arweave` package](https://www.npmjs.com/package/arweave)

**Returns**
`Promise` that resolves to a `string` representing the address of the wallet that owns the ArweaveID `name` or blank string if name is available

### `getIdenticon(name: string): string`

**Parameters
1. `name` - a string to generate an identicon for

**Returns**
A Base64 encoded `string` representing an identicon with a image/png MIME-type which can be used as the avatar for an ArweaveID
