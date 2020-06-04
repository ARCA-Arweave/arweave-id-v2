import Arweave from 'arweave/node';
import axios from 'axios';

const arweave = Arweave.init({
  host: 'perma.online',
  port: 443,
  protocol: 'https',
});


export async function retrieveArweaveIdV1fromAddress(address?: string): Promise<string> {
  var query =
    `query { transactions(from:["${address}"],tags: [{name:"App-Name", value:"arweave-id"},{name:"Type", value:"name"}]) {id}}`;
  return axios
    .post('https://perma.online:443/arql', { query: query })
    .then(res => arweave.transactions.getData(res.data.data.transactions[0].id as string, { decode: true, string: true }))
    .then(name => name as string);

}

