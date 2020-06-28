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

	it('get gets a wallet\'s name for an account with a V2 ID', async () => {
		expect(1)

		let res: ArweaveID.ArweaveId = await ArweaveID.get('aoaJNC8NcKVfgwaUj6kyJi2hKrVGUsRHCGf8RhKnsic', arweave)

		expect(res.name).toEqual("Testy Mc Testface")
		expect(res.avatarDataUri).toBeDefined() 
	}, 20000)
	it('get gets a wallet\'s name with a V1 ID', async () => {
		expect(1)

		let res: ArweaveID.ArweaveId = await ArweaveID.get('ovNqyRqs9ue4pCzc6SiLQ8UMxxLagnoTpR1LUeEstU8', arweave)

		expect(res).toEqual({"name": "clemente"})
	}, 20000)
	it('get gets a wallet\'s discord name with a V1 ID', async () => {
		expect(1)

		let res: ArweaveID.ArweaveId = await ArweaveID.get('CvbdmU66JFe5D14j2wYZEFSfO1hZY8dZy4W-9Ev2q0Y', arweave)

		expect(res).toEqual({ "name": 'sparrow' })
	}, 20000)


	// it('set accepts name & PNG avatar, & returns valid ISetReturn', async () => {
	// 	expect(1)
	// 	let address = await arweave.wallets.jwkToAddress(jwk)
	// 	let aridData: ArweaveID.ArweaveId = {
	// 		name: 'Testy Mc Testface',
	// 		avatarDataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACAUlEQVRo3u3Yz2oTURTH8Y8FKwgtqCC4UFBRtGm2bnSn6KoglPoc4gsoulOUhhZ9CPEJ/INIV6WuUrXgqgr+2VRtrW4qupgJpjfTIWNvMinOF85iMmfO+Z075/6ZUFFRUVFREZc6GljE99QWMY3xssXlsQf38Qu/t7ANzGK4bLFZ4p/lCA/t6aAV8aCA+JbNlC26RV1n27zDJEZSu4wlne1UK1s8yeQMxe/P8NuX3mv3vVe2eHgViJrM8Z0KfJtli4fVQNRIju9o4Lu63eRDfS52V+yAMQp4H1yfz/G9FFwvxy7oX5i2uS2WJBM25EBa7MBN4nHJkhiuRFOSnh/FlQzxGxgrW3yLWcU3skbZotsZxpMC4h9jd9mis4qY0dlOYds0BlF8OzXJ5GxiLbUm7hqgnq+IRayd8RDO4gxO4CQO+nusWMNnvE1tHnP4VGbxddzSeUwuYq9xU58/Nc8ptmR2a3OY0IPzUosjeNGlmJ+Sc04zteX0t26efY7DscVfxEpO0gXcTkfw6BajOJTem8AdvMyJt4ILscSPYT0jyQdcx7FtxD6OG/iYEX8dp2IU8CgI/A1Xxf1XYRjX0tjtuR7GCP41GJVe7qY1m9/2lxhBw17vNQtBzlz6/UkZnW7W3PZR+IE3PdZ0Gnu71Vi0gDLI1bjjW2jHF1BRUVFR8X/zB5QwC6hSipIvAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIwLTA2LTE3VDE2OjU3OjQ5KzAwOjAwVKycbgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMC0wNi0xN1QxNjo1Nzo0OSswMDowMCXxJNIAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC'
	// 	}

	// 	let res: ArweaveID.ISetReturn = await ArweaveID.set(aridData,jwk,arweave)

	// 	expect(res.txid).toHaveLength(43) //<= I am just testing for a string 43 characters long here
	// 	expect(res.statusCode).toBeGreaterThanOrEqual(200)
	// 	expect(res.statusMessage).toHaveLength
	// }, 20000)
	it('set accepts name & non-base64 SVG avatar, & returns valid ISetReturn', async () => {
		expect(1)
		let address = await arweave.wallets.jwkToAddress(jwk)
		let aridData: ArweaveID.ArweaveId = {
			name: 'Testy Mc Testface',
			avatarDataUri: 'data:image/svg+xml,<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M12,19.2C9.5,19.2 7.29,17.92 6,16C6.03,14 10,12.9 12,12.9C14,12.9 17.97,14 18,16C16.71,17.92 14.5,19.2 12,19.2M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" /></svg>'
		}

		let res: ArweaveID.ISetReturn = await ArweaveID.set(aridData,jwk,arweave)

		expect(res.txid).toHaveLength(43) //<= I am just testing for a string 43 characters long here
		expect(res.statusCode).toBeGreaterThanOrEqual(200)
		expect(res.statusMessage).toHaveLength
	}, 20000)

})



