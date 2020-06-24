// import Arweave from 'arweave/node';
import IArweave from './types/IArweave';
import { JWKInterface } from './types/JwkInterface';
import axios, { AxiosResponse } from 'axios';
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
		return { name: ''}; 

	var id: ArweaveId = { name: '' };
	let v2Txns = transactions.filter(txn => txn.tags.filter(tag => tag['value'] === '0.0.2').length > 0);
	let v1Txns = transactions.filter(txn => txn.tags.filter(tag => tag['value'] === '0.0.1').length > 0);

	// If a V2 ID is found, populate the ArweaveID tags based on the v2 transaction
	if (v2Txns.length > 0) {
		var nameTxn = v2Txns[0];

		// Find correct ArweaveID based on getAddressFromArweaveID rules
		for (var j = 1; j < v2Txns.length; j++) {
			if (address != await getAddressFromArweaveID(nameTxn.tags.filter(tag => tag['name'] == 'Name'), arweaveInstance)['value'])
			{
				nameTxn = v2Txns[j];
			}
		}
		let contentType = ''
		for (var j = 0; j < nameTxn.tags.length; j++) {
			let tag = nameTxn.tags[j]
			switch (tag['name']) {
				case 'Name': id.name = tag['value']; break;
				case 'Email': id.email = tag['value']; break;
				case 'Ethereum': id.ethereum = tag['value']; break;
				case 'Twitter': id.ethereum = tag['value']; break;
				case 'Discord': id.ethereum = tag['value']; break;
				case 'Content-Type': contentType = tag['value']; break;
				default:
			}
		}
		if (contentType === 'arweave/transaction') {
			let originalAvatarTxn = await arweaveInstance.transactions.getData(nameTxn.id as string);
			id.avatarDataUri = `data;base64,${await arweaveInstance.transactions.getData(originalAvatarTxn as string)}`;
			//TODO: Fix this so it determines the content-type of the avatar and returns it as part of the URI <- it should be set in the Content-Type tag of the target txn?
		}
		else {
			let base64url = await arweaveInstance.transactions.getData(nameTxn.id)
			let data = arweaveInstance.utils.b64UrlDecode(base64url as string)
			id.avatarDataUri = `data:${contentType};base64,${data}`;
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

export async function setArweaveData(arweaveIdData: ArweaveId, jwk: JWKInterface, arweaveInstance: IArweave): Promise<any> {
	var mediaType: string
	var avatarData: any
	switch (arweaveIdData.avatarDataUri?.split(':')[0]) {
		// If dataURI format, check for optional media type or note unknown
		case 'data':
			let imgData = arweaveIdData.avatarDataUri.split(',')[1]
			avatarData = toUint8Array(imgData);
			mediaType = arweaveIdData.avatarDataUri.split(';')[0].split(':')[1]
			break;
		// If URL is detected, throw error
		case 'http':
		case 'https':
			throw ('Remote images not supported');
		// TODO: If no URI provided, insert fallback avatar
		case undefined:
			mediaType = 'image/png';
			avatarData = identiconEr(arweaveIdData.name);
			break;
		// If not recognizable format, assume URI is Arweave txn and check for a valid transaction and insert transaction string into data field.
		default:
			let txnStatus = await arweaveInstance.transactions.getStatus(arweaveIdData.avatarDataUri as string);
			if (txnStatus.status === 200) {
				mediaType = 'arweave/transaction';
				avatarData = arweaveIdData.avatarDataUri!;
			}
			// If provided URI is not valid arweave txn ID, insert fallback avatar
			else {

				mediaType = 'image/png';
				avatarData = identiconEr(arweaveIdData.name);
			}
	}

	let transaction = await arweaveInstance.createTransaction({ data: avatarData }, jwk);
	transaction.addTag('App-Name', 'arweave-id');
	transaction.addTag('App-Version', '0.0.2');
	transaction.addTag('Name', arweaveIdData.name);
	transaction.addTag('Content-Type', mediaType);

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
	console.log(res);
	return {'txID':transaction.id, 'status_code': res.data.id};
}

export async function getAddressFromArweaveID(arweaveID: string, arweaveInstance: IArweave): Promise<string> {
	const query =
		`query { transactions(tags: [{name:"App-Name", value:"arweave-id"}, {name:"Name", value:"${arweaveID}"}]) {id tags{name value}}}`;
	const res = await axios
		.post(`${arweaveInstance.api.config.protocol}://${arweaveInstance.api.config.host}:${arweaveInstance.api.config.port}/arql`
			, { query: query });
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
		let nameTxn = await arweaveInstance.transactions.get(arweaveIDTxns[arweaveIDTxns.length-1].id) 
		return await arweaveInstance.wallets.ownerToAddress(nameTxn.owner);
	}
	return '';
}

function identiconEr(name: string): string {
	const hash = new SHA256;
	return new identicon(hash.hex(name)).toString();
}

async function getArweaveIDTxnsForAddress(address: string, arweaveInstance: IArweave): Promise<any[]>{
	var query =
	`query { transactions(from:["${address}"],tags: [{name:"App-Name", value:"arweave-id"}]) {id tags{name value}}}`;
	let res = await axios
	.post(`${arweaveInstance.api.config.protocol}://${arweaveInstance.api.config.host}:${arweaveInstance.api.config.port}/arql`
		, { query: query });
	return res.data.data.transactions;
}