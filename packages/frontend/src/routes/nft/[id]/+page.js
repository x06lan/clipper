import { error } from '@sveltejs/kit';
import { nfts } from '../../../placeholder/nfts.json' // TODO
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    console.log('params', params)
    const id = params.id
    // use contract to verify the id
    // and get the contents of the NFT
    // TODO
    for (const nft of nfts) {
        if (nft.id == id) {
            return { props: { nft } };
        }
    }
    error(404, 'Not found');
}
