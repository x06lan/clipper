import { error } from '@sveltejs/kit';
import { nfts } from '../../../placeholder/nfts.json' // TODO
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    console.log('params', params)
    const id = params.id
    if (id > 10000) {
        return { nftData: { id } };
    }
    // use contract to verify the id
    // and get the contents of the NFT
    // TODO

    for (const nft of nfts) {
        if (nft.id == id) {
            return { nftData: { nft, id } };
        }
    }
    error(404, 'Not found');
}
