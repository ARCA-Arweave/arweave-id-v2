# arweave-id Version 2

This library serves an easy to use developer's interface to arweave-id. Arweave-id is an identity service for the permaweb a.k.a. Arweave open web.
This library encapsulates, enforces, and abstracts away arweave-id rules, for example, to prevent name masquerading.

For an example of an app using this library, see the companion repo [arweave-id-v2-ui](https://github.com/ARCA-Arweave/arweave-id-v2-ui)

For more information about Arweave see https://arweave.org

## Usage

### Basic Usage
```javascript
import Arweave from 'arweave/web'
import { get } from 'arweave-id'

const arweave = Arweave.init({})
const userAddress = 'aoaJNC8NcKVfgwaUj6kyJi2hKrVGUsRHCGf8RhKnsic'

// then inside an async function:
let arId = await get(userAddress, arweave)
console.log(arId.name) // 'Testy Mc Testface'
```

### ArweaveId interface
```javascript
interface  ArweaveId {
  name: string     // username
  url?: string     // an optional http link for the user
  text?: string    // optional freeform text
  avatarDataUri?: string    // optional data URI containing the user's avatar
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
Creates, signs, and submits an arweave-id transaction claiming ownership of the ArweaveId provided.

**Parameters**
1. `arweaveIdData` - `ArweaveId`: an `ArweaveId` object to be written to the permaweb.
2. `jwk` - `JWKInterface`: the user's arweave wallet [JWK](https://docs.arweave.org/developers/server/http-api#key-format)
3. `arweaveInstance` - `Arweave`: an `arweave` object generated from the [`arweave` package](https://www.npmjs.com/package/arweave)

**Returns**
`Promise` that resolves to an `ISetReturn` object
1. `txid` - `string` - The transaction ID generated for the transaction. Treat this txid like you would for any other arweave transaction. N.B. This will be a blank string if the data cannot be posted.
2. `statusCode` - `number` - The HTTP status code received back from the Arweave node (e.g. 200 if transaction successfully posted)
3. `statusMessage` - `string` - The status message associated with the HTTP status code response (e.g. 'OK' if transaction successfully posted)

### `check(name: string, arweaveInstance: IArweave): Promise<string>`
Look up an arweave-id name to see if it's available, returns an empty string `''` or the owners address.

**Parameters**
1. `name` - `string` - The ArweaveID to be looked up
2. `arweaveInstance` - `Arweave`: an `arweave` object generated from the [`arweave` package](https://www.npmjs.com/package/arweave)

**Returns**
`Promise` that resolves to a `string` representing the address of the wallet that owns the ArweaveID `name` or blank string if name is available

### `getIdenticon(name: string): string`
This function is provided as a method of generating an avatar for the user. Example usage, when the optional avatar has not been set.

**Parameters
1. `name` - a string to generate an identicon for

**Returns**
A [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) containing the indenticon image. This can be directly set to an `img` tag's `src` property, for example. For reference, the enclosed image format is a base64 encoded PNG, of pixel size 64x64.
