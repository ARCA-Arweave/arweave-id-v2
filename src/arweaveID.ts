import Arweave from 'arweave/node';
import axios from 'axios';
import jwkInterface from 'json-schema';

export interface ArweaveId {
    name: string
    email?: string
    ethereum?: string
    twitter?: string
    discord?: string
    avatarDataUri?: string
}

export async function retrieveArweaveIdV1fromAddress(address: string, arweaveInstance: Arweave): Promise<ArweaveId | string> {
    var query =
        `query { transactions(from:["${address}"],tags: [{name:"App-Name", value:"arweave-id"},{name:"Type", value:"name"}]) {id}}`;
    return axios
        .post(`${arweaveInstance.api.config.protocol}://${arweaveInstance.api.config.host}:${arweaveInstance.api.config.port}/arql`
            , { query: query })
        .then(function(res) {
            return arweaveInstance.transactions.getData(res.data.data.transactions[0].id as string, { decode: true, string: true })}
            )
        .then(function(arweaveName) {
            let id = {name: arweaveName as string};
            return id;    
        })
        .catch(err => `Error: ${err}`)
}

export async function setArweaveData(arweaveIdData: ArweaveId, jwk: string, arweaveInstance: Arweave ): Promise<string> {
    let key = JSON.parse(jwk);
    let mediaType = arweaveIdData.avatarDataUri? arweaveIdData.avatarDataUri.split(';')[0].split(':')[1] : 'Unknown/type';
    let avatarData = arweaveIdData.avatarDataUri? arweaveIdData.avatarDataUri.split(',')[1] : 'Put identicon here';
    let transaction = await arweaveInstance.createTransaction({data:avatarData}, key);
    transaction.addTag('App-Name','arweave-id');
    transaction.addTag('App-Version','0.0.2');
    transaction.addTag('name', arweaveIdData.name);
    transaction.addTag('Content-Type',mediaType);
    if (arweaveIdData.email !== undefined){
        transaction.addTag('email',arweaveIdData.email);
    }
    if (arweaveIdData.ethereum !== undefined){
        transaction.addTag('ethereum',arweaveIdData.ethereum);
    }
    if (arweaveIdData.twitter !== undefined){
        transaction.addTag('twitter',arweaveIdData.twitter);
    }
    if (arweaveIdData.discord !== undefined){
        transaction.addTag('discord',arweaveIdData.discord);
    }
    await arweaveInstance.transactions.sign(transaction, key);
    
    console.log('Transaction verified: ' + await arweaveInstance.transactions.verify(transaction));
    console.log('Transaction id is ' +transaction.id);
    return transaction.id;
}

