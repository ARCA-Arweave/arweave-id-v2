import Arweave from 'arweave/node';
import axios from 'axios';

export interface ArweaveId {
    name: string
    email?: string
    ethereum?: string
    twitter?: string
    discord?: string
    avatarDataUri?: string
}

export async function retrieveArweaveIdV1fromAddress(address: string, arweaveInstance: Arweave): Promise<ArweaveId> {
    var query =
        `query { transactions(from:["${address}"],tags: [{name:"App-Name", value:"arweave-id"},{name:"Type", value:"name"}]) {id}}`;
    return axios
        .post(`${arweaveInstance.api.config.protocol}://${arweaveInstance.api.config.host}:${arweaveInstance.api.config.port}/arql`
            , { query: query })
        .then(function(res) {
            return arweaveInstance.transactions.getData(res.data.data.transactions[0].id as string, { decode: true, string: true })}
            )
        .then(function(arweaveName) {
            let id = {name: arweaveName as any};
            return id;    
        })
}

