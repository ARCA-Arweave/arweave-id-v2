import * as ArweaveID from './arweaveID'
import Arweave from 'arweave/node'
//import jwk from './secrets/jwk.json'

describe('Test arweaveID.ts functions',()=>{
	const arweave = Arweave.init({
    host: 'arweave.net',// Hostname or IP address for a Arweave host
    port: 443,          // Port
    protocol: 'https',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false,     // Enable network request logging
})

	it('retrieveArweaveIdfromAddress gets a wallet\'s name for an account with a V2 ID', async () => {
		expect(1)

		let res: ArweaveID.ArweaveId = await ArweaveID.retrieveArweaveIdfromAddress('v2XXwq_FvVqH2KR4p_x8H-SQ7rDwZBbykSv-59__Avc', arweave)


		expect(res.name).toEqual("RosMcMahon2")
	})
	it('retrieveArweaveIdfromAddress gets a wallet\'s name with a V1 ID', async () => {
		expect(1)

		let res: ArweaveID.ArweaveId = await ArweaveID.retrieveArweaveIdfromAddress('ovNqyRqs9ue4pCzc6SiLQ8UMxxLagnoTpR1LUeEstU8', arweave)

		expect(res).toEqual({"name": "clemente"})
	})
	it('retrieveArweaveIdfromAddress gets a wallet\'s discord name with a V1 ID', async () => {
		expect(1)

		let res: ArweaveID.ArweaveId = await ArweaveID.retrieveArweaveIdfromAddress('CvbdmU66JFe5D14j2wYZEFSfO1hZY8dZy4W-9Ev2q0Y', arweave)

		expect(res).toEqual({ "name": 'sparrow', "discord": 'Sparrow#2791' })
	})/*
	it('setArweaveData returns a new transaction id', async () => {
		expect(1)
		let address = await arweave.wallets.jwkToAddress(jwk)
		let aridData: ArweaveID.ArweaveId = {
			name: 'RosMcMahon2'
		}

		let res = await ArweaveID.setArweaveData(aridData,jwk,arweave)

		expect(res).toMatch(/\S{43}/) //<= I am just testing for a string 43 characters long here
	})*/

})



