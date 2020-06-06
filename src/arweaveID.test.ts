import * as ArweaveID from './arweaveID'
import Arweave from 'arweave/node'
import jwk from './secrets/jwk.json'

describe('Test arweaveID.ts functions',()=>{
	const arweave = Arweave.init({
    host: 'arweave.net',// Hostname or IP address for a Arweave host
    port: 443,          // Port
    protocol: 'https',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false,     // Enable network request logging
})

	it('retrieveArweaveIdV1fromAddress gets a wallet\'s name', async () => {
		expect(1)
		let address = await arweave.wallets.jwkToAddress(jwk)
		let res = await ArweaveID.retrieveArweaveIdV1fromAddress('v2XXwq_FvVqH2KR4p_x8H-SQ7rDwZBbykSv-59__Avc', arweave)

		expect(res).toEqual({"name": "RosMcMahon"})
	})
	it('setArweaveData returns a new transaction id', async () => {
		expect(1)
		let aridData: ArweaveID.ArweaveId = {
			name: 'RosMcMahon2'
		}

		let res = await ArweaveID.setArweaveData(aridData,jwk,arweave)

		expect(res).toMatch(/\S{43}/) //<= I am just testing for a string 43 characters long here
	})

})



