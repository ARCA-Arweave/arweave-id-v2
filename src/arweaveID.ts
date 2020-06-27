import IArweave from './types/IArweave';
import { JWKInterface } from './types/JwkInterface';
import axios from 'axios';
import identicon from 'identicon.js';
import { SHA256 } from 'jshashes';
const toUint8Array = require('base64-to-uint8array')

export interface ArweaveId {
	name: string
	email?: string
	ethereum?: string
	twitter?: string
	discord?: string
	avatarDataUri?: string
}

export async function retrieveArweaveIdFromAddress(address: string, arweaveInstance: IArweave): Promise<ArweaveId> {
	let transactions = await getArweaveIDTxnsForAddress(address, arweaveInstance);
	if (transactions.length == 0)
		return { name: '' };

	var id: ArweaveId = { name: '' };
	let v2Txns = transactions.filter(txn => txn.tags.filter(tag => tag['value'] === '0.0.2').length > 0);
	let v1Txns = transactions.filter(txn => txn.tags.filter(tag => tag['value'] === '0.0.1').length > 0);

	// If a V2 ID is found, populate the ArweaveID tags based on the v2 transaction
	if (v2Txns.length > 0) {
		let nameTxn = v2Txns[0];
		// Find correct ArweaveID based on getAddressFromArweaveID rules
		for (var j = 1; j < v2Txns.length; j++) {
			if (address != await getAddressFromArweaveID(nameTxn.tags.filter(tag => tag['name'] == 'Name')[0]['value'], arweaveInstance)) {
				nameTxn = v2Txns[j]; //Work backwards through the list of name transactions to exclude any made for a name already owned by another address
			}
			else {
				console.log(`name transaction == ${nameTxn.id}`);
				break;
			}
		}
		let encodedAvatarData = await arweaveInstance.transactions.getData(nameTxn.id, {decode: true}) as Uint8Array;
		let decodedAvatarData = arweaveInstance.utils.bufferTob64(encodedAvatarData);
		let contentType = ''
		for (var j = 0; j < nameTxn.tags.length; j++) {
			let tag = nameTxn.tags[j]
			switch (tag['name']) {
				case 'Name': id.name = tag['value']; break;
				case 'Email': id.email = tag['value']; break;
				case 'Ethereum': id.ethereum = tag['value']; break;
				case 'Twitter': id.twitter = tag['value']; break;
				case 'Discord': id.discord = tag['value']; break;
				case 'Content-Type': contentType = tag['value']; id.avatarDataUri = `data:${contentType};base64,${decodedAvatarData}`; break;
				default:
			}
		}

	} else { //If no V2 ID is found, find the most recent V1 name transaction
		let v1NameTxns = v1Txns.filter(txn => txn.tags.filter(tag => tag['value'] === 'name').length > 0);
		if (v1NameTxns.length > 0) {
			id.name = await arweaveInstance.transactions.getData(v1NameTxns[0].id as string, { decode: true, string: true }) as string;
		}
		// If no name field set, set name equal to Arweave address as default
		else id.name = address;
	}

	// Check to see if any elements are not populated and then check to see if there are any V1 transactions corresponding to that element
	if (id.email == undefined) {
		let v1EmailTxns = v1Txns.filter(txn => txn.tags.filter(tag => tag['value'] === 'email').length > 0);
		if (v1EmailTxns.length > 0) {
			id.email = await arweaveInstance.transactions.getData(v1EmailTxns[0].id as string, { decode: true, string: true }) as string;
		}
	}
	if (id.ethereum == undefined) {
		let v1EthTxns = v1Txns.filter(txn => txn.tags.filter(tag => tag['value'] === 'ethereum').length > 0);
		if (v1EthTxns.length > 0) {
			id.ethereum = await arweaveInstance.transactions.getData(v1EthTxns[0].id as string, { decode: true, string: true }) as string;
		}
	}
	if (id.twitter == undefined) {
		let v1TwitterTxns = v1Txns.filter(txn => txn.tags.filter(tag => tag['value'] === 'twitter').length > 0);
		if (v1TwitterTxns.length > 0) {
			id.twitter = await arweaveInstance.transactions.getData(v1TwitterTxns[0].id as string, { decode: true, string: true }) as string;
		}
	}
	if (id.discord == undefined) {
		let v1DiscordTxns = v1Txns.filter(txn => txn.tags.filter(tag => tag['value'] === 'discord').length > 0);
		if (v1DiscordTxns.length > 0) {
			id.discord = await arweaveInstance.transactions.getData(v1DiscordTxns[0].id as string, { decode: true, string: true }) as string;
		}
	}

	return id;
}

export interface ISetReturn {
	txid: string
	statusCode: number
	statusMessage: string
}
export async function setArweaveData(arweaveIdData: ArweaveId, jwk: JWKInterface, arweaveInstance: IArweave): Promise<ISetReturn> {

	/* Verify that submitted name is not already taken */
	let signingAddress = await arweaveInstance.wallets.ownerToAddress(jwk.n);
	let idOwnerAddress = await getAddressFromArweaveID(arweaveIdData.name, arweaveInstance);
	if ((idOwnerAddress !== '') && (idOwnerAddress !==signingAddress )){
		return { txid: '', statusCode: 400, statusMessage: 'Name already taken'}
	}
	
	/* Handle the dataUri string */
	var mediaType: string = ''
	var avatarData: string
	switch (arweaveIdData.avatarDataUri?.split(':')[0]) {
		// If dataURI format, check for optional media type or note unknown
		case 'data':
			// Example dataUri strings:
			// data:image/jpeg;base64,/9j/2wCEAAMCAgMC...
			// data:image/png;base64,iVBORw0KGgoAAA...
			// data:image/svg+xml;base64,PHN2ZyB4bWxucz0i...
			// data:image/svg+xml,<?xml version="1.0...><svg xmlns="http://www.w3.org/2000/s...><path d="M12,19.2C9.5,19.2 7.29,17.92...
			avatarData = arweaveIdData.avatarDataUri.split(',').slice(1).join(',') //removes first array element of ',' split
			let meta = arweaveIdData.avatarDataUri.split(',')[0]
			if(meta.split(';')[1]){
				console.log('base64 detected')
				avatarData = toUint8Array(avatarData); //if base64 convert to binary using toUnit8Array(base64string)
				mediaType = meta.split(';')[0].split(':')[1]
			}else{
				mediaType = meta.split(':')[1]
			}
			break;
		// If URL is detected, throw error
		case 'http':
		case 'https':
			throw ('Remote images not supported');
		// If no URI provided, insert '0' in data field so transaction can be submitted
		case undefined:
			avatarData = '0'
			break;
		default:
			// If provided URI is not valid, insert '0' in data field so transaction can be submitted
			avatarData = '0'

	}

	/* Compose & send the transaction */

	let transaction = await arweaveInstance.createTransaction({ data: avatarData }, jwk);
	transaction.addTag('App-Name', 'arweave-id');
	transaction.addTag('App-Version', '0.0.2');
	transaction.addTag('Name', arweaveIdData.name.trim());
	mediaType.length===0 ? mediaType = 'none' : transaction.addTag('Content-Type', mediaType);
	console.log('Media Type is ' + mediaType);

	// Set additional fields if present on ArweaveID instance that is passed
	if (arweaveIdData.email !== undefined) {
		transaction.addTag('Email', arweaveIdData.email);
	}
	if (arweaveIdData.ethereum !== undefined) {
		transaction.addTag('Ethereum', arweaveIdData.ethereum);
	}
	if (arweaveIdData.twitter !== undefined) {
		transaction.addTag('Twitter', arweaveIdData.twitter);
	}
	if (arweaveIdData.discord !== undefined) {
		transaction.addTag('Discord', arweaveIdData.discord);
	}

	await arweaveInstance.transactions.sign(transaction, jwk);

	console.log('Transaction verified: ' + await arweaveInstance.transactions.verify(transaction));
	console.log('Transaction id is ' + transaction.id);

	const res = await arweaveInstance.transactions.post(transaction)
	const status = await arweaveInstance.transactions.getStatus(transaction.id)

	return { txid: transaction.id, statusCode: status.status, statusMessage: res.statusText };
}

export async function getAddressFromArweaveID(name: string, arweaveInstance: IArweave): Promise<string> {
	const query =
		`query { transactions(tags: [{name:"App-Name", value:"arweave-id"}, {name:"Name", value:"${name}"}]) {id tags{name value}}}`;
	const res = await axios.post(
		`${arweaveInstance.api.config.protocol}://${arweaveInstance.api.config.host}:${arweaveInstance.api.config.port}/arql`,
		{ query: query }
	);
	let arweaveIDTxns = res.data.data.transactions  // Gets all transactions that claim 'arweaveID' 
	/*
	if (arweaveIDTxns.length > 0){
		var nameTxn = await arweaveInstance.transactions.get(arweaveIDTxns[arweaveIDTxns.length-1].id)  //Set owning transaction as earliest transaction by earliest blocktime
		do {
		var owner = await arweaveInstance.wallets.ownerToAddress(nameTxn.owner);
		let ownerTxns = await getArweaveIDTxnsForAddress(owner, arweaveInstance);
		let ownerNameChanges = ownerTxns.filter(txn => txn.tags.filter(tag => tag['type'] === 'Name' && tag['value'] !== arweaveID).length > 0)
		if (ownerNameChanges.length == 0) return owner;  // If oldest claimant has never changed to another name, owner is found 
		let ownerNameChangeTxnIndex = ownerTxns.findIndex(txn => txn.id == ownerNameChanges[ownerNameChanges.length-1].id)
		var j = arweaveIDTxns.length-1
		do{
			arweaveIDTxns.pop();		//Remove all name changes from oldest to newest up to when owner released name
			j--;
		} while (arweaveIDTxns[j].id != ownerTxns[ownerNameChangeTxnIndex+1].id)	
		arweaveIDTxns.pop();			//Remove previous owner's claim
		var nameTxn = await arweaveInstance.transactions.get(arweaveIDTxns[arweaveIDTxns.length-1].id) // Set owning transaction to remaining earliest transaction
		} while (true);
	}*/

	if (arweaveIDTxns.length > 0) {
		let nameTxn = await arweaveInstance.transactions.get(arweaveIDTxns[arweaveIDTxns.length - 1].id)
		return await arweaveInstance.wallets.ownerToAddress(nameTxn.owner);
	}
	return '';
}

async function getArweaveIDTxnsForAddress(address: string, arweaveInstance: IArweave): Promise<any[]> {
	var query =
		`query { transactions(from:["${address}"],tags: [{name:"App-Name", value:"arweave-id"}]) {id tags{name value}}}`;
	let res = await axios
		.post(`${arweaveInstance.api.config.protocol}://${arweaveInstance.api.config.host}:${arweaveInstance.api.config.port}/arql`
			, { query: query });
	return res.data.data.transactions;
}

export function getIdenticon(name: string): string {
	const hash = new SHA256;
	let identiconString = new identicon(hash.hex(name)).toString();
	return `data:image/png;base64,${identiconString}`;
}